// lib/prisma.ts - Optimized for cPanel shared hosting
import { PrismaClient } from '@prisma/client'
import { setPrismaClient } from './logger'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create the database URL with proper connection parameters
const getDatabaseUrl = () => {
	const baseUrl = process.env.DATABASE_URL

	// Check if URL already has query parameters
	const separator = baseUrl?.includes('?') ? '&' : '?'

	return `${baseUrl}${separator}connection_limit=8&pool_timeout=30&connect_timeout=60&socket_timeout=60&statement_timeout=30000`
}

// Create Prisma client with shared hosting optimizations
export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error'],
		datasources: {
			db: {
				url: getDatabaseUrl(),
			},
		},
	})

// Shared hosting specific connection management
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}

// Handle connection cleanup for serverless/shared environments
process.on('beforeExit', async () => {
	await prisma.$disconnect()
})

process.on('SIGINT', async () => {
	await prisma.$disconnect()
	process.exit(0)
})

process.on('SIGTERM', async () => {
	await prisma.$disconnect()
	process.exit(0)
})

// Set the Prisma client for the logger
setPrismaClient(prisma)

export const getPrismaClient = () => prisma

// Health check function for connection testing
export async function testDatabaseConnection() {
	try {
		const startTime = Date.now()
		await prisma.$queryRaw`SELECT 1`
		const duration = Date.now() - startTime

		console.log(`✅ Database connection successful (${duration}ms)`)
		return {
			status: 'connected',
			duration,
			timestamp: new Date().toISOString(),
		}
	} catch (error: any) {
		console.error('❌ Database connection failed:', error)
		return {
			status: 'failed',
			error: error.message,
			code: error.code,
			timestamp: new Date().toISOString(),
		}
	}
}

// Connection monitoring function
export async function getConnectionStats() {
	try {
		const [activeConnections, yourConnections] = await Promise.all([
			prisma.$queryRaw`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'`,
			prisma.$queryRaw`SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`,
		])

		return {
			activeConnections: Number((activeConnections as any)[0].count),
			yourConnections: Number((yourConnections as any)[0].count),
			timestamp: new Date().toISOString(),
		}
	} catch (error: any) {
		console.error('Failed to get connection stats:', error)
		return {
			error: error.message,
			timestamp: new Date().toISOString(),
		}
	}
}
