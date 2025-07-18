// app/api/logdrain/route.ts (Next.js 15+ App Router)
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic' // Ensure this is not statically optimized
// Types for Vercel log entries
interface VercelLogEntry {
	id: string
	message: string
	timestamp: number
	source: 'build' | 'static' | 'lambda' | 'edge'
	projectId: string
	deploymentId: string
	buildId?: string
	host?: string
	path?: string
	method?: string
	statusCode?: number
	userAgent?: string
	referer?: string
	ip?: string
	region?: string
	requestId?: string
	proxy?: {
		timestamp: number
		method: string
		scheme: string
		host: string
		path: string
		userAgent: string
		referer: string
		statusCode: number
		clientIp: string
		region: string
		cacheId?: string
	}
}

interface LogDrainPayload {
	logs: VercelLogEntry[]
}

// Verify the webhook signature from Vercel
function verifySignature(
	payload: string,
	signature: string,
	secret: string,
): boolean {
	const hmac = crypto.createHmac('sha256', secret)
	hmac.update(payload)
	const digest = hmac.digest('hex')
	return crypto.timingSafeEqual(
		Buffer.from(signature, 'hex'),
		Buffer.from(digest, 'hex'),
	)
}

// Enhanced log processing with your Prisma model in mind
function processLogEntry(log: VercelLogEntry) {
	const level = determineLogLevel(log)
	const action = mapVercelSourceToAction(log.source)

	console.log(`[${level}] ${action}: ${log.message}`)

	// Handle different log levels
	switch (level) {
		case 'ERROR':
			console.error(`Vercel Error in ${log.projectId}:`, {
				message: log.message,
				deploymentId: log.deploymentId,
				source: log.source,
				statusCode: log.proxy?.statusCode,
				path: log.proxy?.path,
			})

			// Send immediate alerts for errors
			sendErrorAlert(log)
			break

		case 'WARN':
			console.warn(`Vercel Warning:`, {
				message: log.message,
				statusCode: log.proxy?.statusCode,
				path: log.proxy?.path,
			})
			break

		case 'INFO':
			// Log successful requests, deployments, etc.
			if (log.proxy?.statusCode && log.proxy.statusCode < 400) {
				console.info(
					`Request: ${log.proxy.method} ${log.proxy.path} - ${log.proxy.statusCode}`,
				)
			}
			break

		case 'DEBUG':
			// Build logs and detailed information
			console.debug(`Build/Debug: ${log.message}`)
			break
	}
}

// Error alerting function
async function sendErrorAlert(log: VercelLogEntry) {
	// Example: Send to Slack or other alerting system
	if (process.env.SLACK_WEBHOOK_URL) {
		try {
			await fetch(process.env.SLACK_WEBHOOK_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: `🚨 Vercel Error Alert`,
					blocks: [
						{
							type: 'section',
							text: {
								type: 'mrkdwn',
								text: `*Project:* ${log.projectId}\n*Message:* ${log.message}\n*Source:* ${log.source}`,
							},
						},
						...(log.proxy
							? [
									{
										type: 'section',
										fields: [
											{ type: 'mrkdwn', text: `*Path:* ${log.proxy.path}` },
											{
												type: 'mrkdwn',
												text: `*Status:* ${log.proxy.statusCode}`,
											},
											{ type: 'mrkdwn', text: `*Method:* ${log.proxy.method}` },
											{ type: 'mrkdwn', text: `*Region:* ${log.proxy.region}` },
										],
									},
								]
							: []),
					],
				}),
			})
		} catch (error) {
			console.error('Failed to send Slack alert:', error)
		}
	}
}

// Map Vercel log sources to actions
function mapVercelSourceToAction(source: string): string {
	switch (source) {
		case 'build':
			return 'vercel_build'
		case 'lambda':
			return 'vercel_function'
		case 'edge':
			return 'vercel_edge'
		case 'static':
			return 'vercel_static'
		default:
			return 'vercel_log'
	}
}

// Map log content to LogLevel
function determineLogLevel(
	log: VercelLogEntry,
): 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' {
	const message = log.message.toLowerCase()

	if (
		message.includes('error') ||
		(log.proxy?.statusCode && log.proxy.statusCode >= 500)
	) {
		return 'ERROR'
	}
	if (
		message.includes('warn') ||
		(log.proxy?.statusCode && log.proxy.statusCode >= 400)
	) {
		return 'WARN'
	}
	if (message.includes('debug') || log.source === 'build') {
		return 'DEBUG'
	}
	return 'INFO'
}

async function storeLogs(logs: VercelLogEntry[]) {
	try {
		// Prepare log data for your Prisma model
		const logData = logs.map(log => ({
			userId: null, // Vercel logs are system logs, no user association
			action: mapVercelSourceToAction(log.source),
			message: log.message,
			level: determineLogLevel(log),
			meta: {
				vercelId: log.id,
				projectId: log.projectId,
				deploymentId: log.deploymentId,
				buildId: log.buildId,
				source: log.source,
				timestamp: log.timestamp,
				...(log.proxy && {
					proxy: {
						host: log.proxy.host,
						path: log.proxy.path,
						method: log.proxy.method,
						statusCode: log.proxy.statusCode,
						userAgent: log.proxy.userAgent,
						clientIp: log.proxy.clientIp,
						region: log.proxy.region,
						cacheId: log.proxy.cacheId,
					},
				}),
				...(log.host && { host: log.host }),
				...(log.path && { requestPath: log.path }),
				...(log.method && { method: log.method }),
				...(log.statusCode && { statusCode: log.statusCode }),
				...(log.region && { region: log.region }),
				...(log.requestId && { requestId: log.requestId }),
			},
			duration: null, // Vercel doesn't provide duration in log drain
			createdAt: new Date(log.timestamp),
		}))

		// Batch insert logs
		await prisma.log.createMany({
			data: logData,
			skipDuplicates: true, // In case of retries
		})

		console.log(`Stored ${logData.length} logs to database`)
	} catch (error) {
		console.error('Error storing logs to database:', error)
		throw error
	}
}

export async function GET() {
	const verificationToken = 'a6ccbadcd17f4ba476a321f1b2e79742cc26e68d'

	// Create a new response with the token as BODY
	const response = new NextResponse(verificationToken, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain',
		},
	})

	// Add the verification header
	response.headers.set('x-vercel-verify', verificationToken)

	return response
}

// Handle POST request for actual log data
export async function POST(request: NextRequest) {
	try {
		// const payload: LogDrainPayload = await request.json()
		const payload = await request.json()
		console.log('Payload:', JSON.stringify(payload, null, 2))

		// Temporary simplified response
		return NextResponse.json({ received: true }, { status: 200 })

		// Process logs
		if (!payload.logs || !Array.isArray(payload.logs)) {
			return NextResponse.json(
				{ error: 'Invalid payload structure' },
				{ status: 400 },
			)
		}

		for (const log of payload.logs) {
			processLogEntry(log)
		}

		await storeLogs(payload.logs)

		return NextResponse.json({
			message: 'Logs processed successfully',
			count: payload.logs.length,
		})
	} catch (error) {
		console.error('Error processing log drain:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
