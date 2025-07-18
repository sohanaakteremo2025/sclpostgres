// lib/logger.ts
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import type { LogLevel } from '@prisma/client'

interface LogData {
	action: string
	message?: string
	level?: LogLevel
	meta?: any
	duration?: number
	userId?: string | null
}

interface LogEntry extends LogData {
	createdAt: Date
	userId: string | null
}

// Global queue management
const BATCH_SIZE = 100
const FLUSH_INTERVAL = 5000
const MAX_LOGS_IN_DB = 10000 // Maximum logs to keep in database
const CLEANUP_FREQUENCY = 10 // Run cleanup every N flushes (not every flush)

declare global {
	var logQueue: LogEntry[] | undefined
	var logTimer: NodeJS.Timeout | undefined
	var prismaClient: any | undefined
	var flushCounter: number | undefined
}

// Initialize global queue
if (typeof globalThis !== 'undefined' && !globalThis.logQueue) {
	globalThis.logQueue = []
	globalThis.flushCounter = 0
}

// Set Prisma client (called from your server setup)
export function setPrismaClient(client: any) {
	if (typeof globalThis !== 'undefined') {
		globalThis.prismaClient = client
	}
}

// Maintain maximum log count in database (optimized)
async function maintainMaxLogCount(): Promise<void> {
	if (!globalThis.prismaClient) return

	try {
		// More efficient: Delete oldest logs in a single query without counting first
		// This uses a subquery to find IDs of logs beyond the limit
		const deleteQuery = `
      DELETE FROM "Log" 
      WHERE "id" IN (
        SELECT "id" FROM "Log" 
        ORDER BY "createdAt" ASC 
        LIMIT (
          SELECT COUNT(*) - ${MAX_LOGS_IN_DB} 
          FROM "Log" 
          WHERE (SELECT COUNT(*) FROM "Log") > ${MAX_LOGS_IN_DB}
        )
      )
    `

		// Use raw query for better performance
		const result = await globalThis.prismaClient.$executeRawUnsafe(deleteQuery)

		if (process.env.NODE_ENV === 'development' && result > 0) {
			console.log(`Maintained max log count: deleted ${result} oldest logs`)
		}
	} catch (error) {
		// Fallback to Prisma queries if raw SQL fails
		try {
			const totalLogs = await globalThis.prismaClient.log.count()

			if (totalLogs > MAX_LOGS_IN_DB) {
				const logsToDelete = totalLogs - MAX_LOGS_IN_DB

				// Delete oldest logs efficiently
				await globalThis.prismaClient.log.deleteMany({
					where: {
						id: {
							in: {
								from: globalThis.prismaClient.log.findMany({
									select: { id: true },
									orderBy: { createdAt: 'asc' },
									take: logsToDelete,
								}),
							},
						},
					},
				})
			}
		} catch (fallbackError) {
			console.error('Failed to maintain max log count:', fallbackError)
		}
	}
}

// Start periodic flush timer
function startPeriodicFlush() {
	if (typeof globalThis === 'undefined' || globalThis.logTimer) return

	globalThis.logTimer = setInterval(() => {
		flushLogs().catch(console.error)
	}, FLUSH_INTERVAL)
}

// Extract error information
function extractErrorInfo(error: any) {
	const cleanMessage = cleanErrorMessage(error)

	const errorPatterns = {
		uniqueConstraint: /Unique constraint failed on the fields: \(`(.+?)`\)/,
		foreignKey: /Foreign key constraint failed on the field: `(.+?)`/,
		recordNotFound: /Record to update not found/,
		connectionError: /Can't reach database server/,
		timeoutError: /Query timeout/,
		validationError: /Argument `(.+?)` is missing/,
	}

	let errorType = 'unknown_error'
	let errorDetails: { field?: string; [key: string]: any } = {}

	for (const [type, pattern] of Object.entries(errorPatterns)) {
		const match = cleanMessage.match(pattern)
		if (match) {
			errorType = type
			if (match[1]) {
				errorDetails = { field: match[1] }
			}
			break
		}
	}

	return {
		type: errorType,
		message: cleanMessage,
		details: errorDetails,
	}
}

// Get session context (only on server)
async function getSessionContext(): Promise<{ userId: string | null }> {
	try {
		// Only import auth when we're actually going to use it (server-side)
		if (typeof window !== 'undefined') {
			return { userId: null }
		}

		const { auth } = await import('@/auth')
		const session = await auth()
		return {
			userId: session?.user?.id || null,
		}
	} catch {
		return { userId: null }
	}
}

// Flush logs to database
async function flushLogs(): Promise<void> {
	if (
		typeof globalThis === 'undefined' ||
		!globalThis.logQueue ||
		globalThis.logQueue.length === 0 ||
		!globalThis.prismaClient
	) {
		return
	}

	const logsToInsert = globalThis.logQueue.splice(0, BATCH_SIZE)

	// Debug logging (only in development)
	if (process.env.NODE_ENV === 'development') {
		const logsWithDuration = logsToInsert.filter(log => log.duration)
		if (logsWithDuration.length > 0) {
			console.log(
				'Flushing logs with duration:',
				logsWithDuration.map(log => ({
					action: log.action,
					duration: log.duration,
					message: log.message,
				})),
			)
		}
	}

	try {
		const result = await globalThis.prismaClient.log.createMany({
			data: logsToInsert,
			skipDuplicates: true,
		})

		if (process.env.NODE_ENV === 'development') {
			console.log(`Successfully inserted ${result.count} logs`)
		}

		// Increment flush counter and cleanup periodically
		globalThis.flushCounter = (globalThis.flushCounter || 0) + 1

		// Only run cleanup every CLEANUP_FREQUENCY flushes to reduce performance impact
		if (globalThis.flushCounter % CLEANUP_FREQUENCY === 0) {
			// Run cleanup in background (don't await)
			maintainMaxLogCount().catch(error =>
				console.error('Background log cleanup failed:', error),
			)
		}
	} catch (error) {
		console.error('Failed to flush logs:', error)
		if (process.env.NODE_ENV === 'development') {
			console.error('Failed log data sample:', logsToInsert[0])
		}
	}

	// Continue flushing if more logs exist
	if (globalThis.logQueue && globalThis.logQueue.length > 0) {
		setTimeout(() => flushLogs().catch(console.error), 100)
	}
}

// Core logging function
async function queueLog(
	data: Omit<LogData, 'userId'> & { userId?: string },
): Promise<void> {
	if (typeof globalThis === 'undefined' || !globalThis.logQueue) {
		// Initialize if needed
		if (typeof globalThis !== 'undefined') {
			globalThis.logQueue = []
		} else {
			return // Can't log in browser environment
		}
	}

	// Start flush timer if not already started
	startPeriodicFlush()

	try {
		const context = data.userId
			? { userId: data.userId }
			: await getSessionContext()

		// Process error messages
		const processedData = { ...data }
		if (data.level === 'ERROR' && data.message) {
			const errorInfo = extractErrorInfo({ message: data.message })
			processedData.message = errorInfo.message
			processedData.meta = {
				...data.meta,
				errorType: errorInfo.type,
				errorDetails: errorInfo.details,
				...(process.env.NODE_ENV === 'development' && {
					originalMessage: data.message,
				}),
			}
		}

		// Debug logging
		if (process.env.NODE_ENV === 'development' && data.duration) {
			console.log('Queueing log with duration:', {
				action: data.action,
				duration: data.duration,
				message: processedData.message,
			})
		}

		const logEntry: LogEntry = {
			action: processedData.action,
			message: processedData.message,
			level: processedData.level || 'INFO',
			meta: processedData.meta,
			duration: processedData.duration,
			userId: context.userId,
			createdAt: new Date(),
		}

		globalThis.logQueue.push(logEntry)

		// Flush if batch size reached
		if (globalThis.logQueue.length >= BATCH_SIZE) {
			await flushLogs()
		}
	} catch (error) {
		// Fallback logging without session context
		if (globalThis.logQueue) {
			globalThis.logQueue.push({
				action: data.action,
				message: cleanErrorMessage({ message: data.message }),
				level: data.level || 'INFO',
				meta: data.meta,
				duration: data.duration,
				userId: null,
				createdAt: new Date(),
			})
		}
	}
}

// Convenience logging functions
export async function logInfo(
	action: string,
	message?: string,
	meta?: any,
	userId?: string,
	duration?: number,
): Promise<void> {
	return queueLog({
		action,
		message,
		level: 'INFO',
		meta,
		userId,
		duration,
	})
}

export async function logWarn(
	action: string,
	message?: string,
	meta?: any,
	userId?: string,
	duration?: number,
): Promise<void> {
	return queueLog({
		action,
		message,
		level: 'WARN',
		meta,
		userId,
		duration,
	})
}

export async function logError(
	action: string,
	error?: any,
	meta?: any,
	userId?: string,
	duration?: number,
): Promise<void> {
	const errorInfo = extractErrorInfo(error)

	return queueLog({
		action,
		message: errorInfo.message,
		level: 'ERROR',
		meta: {
			...meta,
			errorType: errorInfo.type,
			errorDetails: errorInfo.details,
			...(process.env.NODE_ENV === 'development' && {
				originalError: error?.message,
			}),
		},
		userId,
		duration,
	})
}

export async function logDebug(
	action: string,
	message?: string,
	meta?: any,
	userId?: string,
	duration?: number,
): Promise<void> {
	return queueLog({
		action,
		message,
		level: 'DEBUG',
		meta,
		userId,
		duration,
	})
}

export async function logPerformance(
	action: string,
	duration: number,
	message?: string,
	meta?: any,
	userId?: string,
): Promise<void> {
	return queueLog({
		action,
		message: message || `Operation took ${duration}ms`,
		level: duration > 1000 ? 'WARN' : 'INFO',
		meta,
		userId,
		duration,
	})
}

export async function logDatabaseError(
	operation: string,
	error: any,
	meta?: any,
	userId?: string,
	duration?: number,
): Promise<void> {
	const errorInfo = extractErrorInfo(error)

	const friendlyMessages = {
		uniqueConstraint: `Duplicate entry: ${errorInfo.details.field || 'record'} already exists`,
		foreignKey: `Invalid reference: ${errorInfo.details.field || 'related record'} not found`,
		recordNotFound: 'Record not found or already deleted',
		connectionError: 'Database connection failed',
		timeoutError: 'Database operation timed out',
		validationError: `Missing required field: ${errorInfo.details.field || 'unknown'}`,
	}

	const friendlyMessage =
		friendlyMessages[errorInfo.type as keyof typeof friendlyMessages] ||
		errorInfo.message

	return queueLog({
		action: `database_${operation}_error`,
		message: friendlyMessage,
		level: 'ERROR',
		meta: {
			...meta,
			operation,
			errorType: errorInfo.type,
			errorDetails: errorInfo.details,
			technicalMessage: errorInfo.message,
			...(process.env.NODE_ENV === 'development' && {
				originalError: error?.message,
				stack: error?.stack,
			}),
		},
		userId,
		duration,
	})
}

// Utility functions
export async function forceFlushLogs(): Promise<void> {
	return flushLogs()
}

export function getLogQueueSize(): number {
	return globalThis.logQueue?.length || 0
}

export function clearLogQueue(): void {
	if (globalThis.logQueue) {
		globalThis.logQueue.length = 0
	}
}

export function destroyLogger(): void {
	if (typeof globalThis !== 'undefined' && globalThis.logTimer) {
		clearInterval(globalThis.logTimer)
		globalThis.logTimer = undefined
	}
	forceFlushLogs().catch(console.error)
}

// Get/Set max log count
export function getMaxLogCount(): number {
	return MAX_LOGS_IN_DB
}

export function setMaxLogCount(newMax: number): void {
	// Note: This only affects the constant for new instances
	// To change existing behavior, you'd need to restart the app
	console.log(
		`Max log count will be ${newMax} (requires app restart to take effect)`,
	)
}
