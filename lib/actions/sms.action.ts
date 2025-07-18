'use server'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import axios from 'axios'
import { getPrismaClient } from '../db'
import { getTenantByDomain } from './tenant.action'
import { calculateSMSCost } from '@/utils/sms-cost-calculator'

export async function sendSMS({
	number,
	message,
}: {
	number: string
	message: string
}) {
	// Skip if no phone number provided
	if (!number || number.trim() === '') {
		console.log('No phone number provided, skipping SMS')
		return { success: false, reason: 'No phone number provided' }
	}

	try {
		const API_KEY = process.env.BULKSMSBD_API_KEY
		const SENDER_ID = process.env.BULKSMSBD_SENDER_ID
		const SMS_API_URL = 'http://bulksmsbd.net/api/smsapi'

		if (!API_KEY || !SENDER_ID) {
			console.log('Missing SMS API credentials, skipping SMS')
			return { success: false, reason: 'Missing API credentials' }
		}

		const tenant = await getTenantByDomain()
		if (!tenant) {
			console.log('Tenant not found, skipping SMS')
			return { success: false, reason: 'Tenant not found' }
		}

		const smsBalance = tenant?.SMSBalance as number

		// Calculate SMS cost using the improved calculator
		const smsInfo = calculateSMSCost(message, number)
		const { messageParts, recipientCount, totalCost } = smsInfo

		if (smsBalance < totalCost) {
			console.log(
				`Insufficient SMS balance. Required: ${totalCost}, Available: ${smsBalance}`,
			)
			return {
				success: false,
				reason: `Insufficient SMS balance. Required: ${totalCost}, Available: ${smsBalance}`,
			}
		}

		// Log SMS usage information
		console.log({
			messageLength: message.length,
			messageParts,
			recipientCount,
			totalCost,
			remainingBalance: smsBalance - totalCost,
			encodingType: smsInfo.messageType,
		})

		// Try to send SMS but handle any errors
		try {
			const response = await axios.get(SMS_API_URL, {
				params: {
					api_key: API_KEY,
					type: 'text',
					number,
					senderid: SENDER_ID,
					message,
				},
			})

			// If successful, update the SMS balance
			const prisma = getPrismaClient()
			await prisma.tenant.update({
				where: {
					id: tenant.id,
				},
				data: {
					SMSBalance: smsBalance - totalCost,
				},
			})

			return {
				success: true,
				...response.data,
				messageParts,
				recipientCount,
				totalCost,
				remainingBalance: smsBalance - totalCost,
			}
		} catch (apiError: any) {
			console.error('SMS API call failed:', apiError)
			return {
				success: false,
				reason: 'SMS API call failed',
				error: apiError.message,
			}
		}
	} catch (error: any) {
		// Log the error but don't throw it to the caller
		console.error('SMS sending failed:', error)
		return {
			success: false,
			reason: 'SMS processing failed',
			error: error.message,
		}
	}
}
// order sms credit
export async function orderSMSCredit({
	tenantId,
	credits,
	price,
	transactionId,
}: {
	tenantId: string
	credits: number
	price: number
	transactionId: string
}) {
	const prisma = getPrismaClient()
	return await prisma.orderSMS.create({
		data: {
			tenantId: tenantId, // Ensure it's an ObjectId
			credits,
			price,
			transactionId,
			status: 'PENDING',
		},
	})
}

// get all pending and approved orders
export async function getAllOrdersForTenant() {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	if (!tenantId) {
		throw new Error('No tenant ID found')
	}
	const prisma = getPrismaClient()
	try {
		const orders = await prisma.orderSMS.findMany({
			where: { tenantId },
			orderBy: {
				createdAt: 'desc',
			},
		})
		return JSON.parse(JSON.stringify(orders))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

// get all orders
export async function getAllOrdersForCMS() {
	const prisma = getPrismaClient()
	try {
		const orders = await prisma.orderSMS.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				tenant: true,
			},
		})
		return JSON.parse(JSON.stringify(orders))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

// update order status
export async function updateOrderStatus(
	id: string,
	status: 'APPROVED' | 'REJECTED',
) {
	const prisma = getPrismaClient()
	try {
		const order = await prisma.orderSMS.update({
			where: { id },
			data: { status },
		})

		// if approve then increase SMSBalance in tenant
		if (status === 'APPROVED') {
			// First, get the current tenant to check if SMSBalance is null
			const tenant = await prisma.tenant.findUnique({
				where: { id: order.tenantId },
				select: { SMSBalance: true },
			})

			// If SMSBalance is null, set it to the credits value
			// Otherwise, increment it
			if (tenant?.SMSBalance === null) {
				await prisma.tenant.update({
					where: { id: order.tenantId }, // Use order.tenantId instead of id
					data: { SMSBalance: order.credits },
				})
			} else {
				await prisma.tenant.update({
					where: { id: order.tenantId }, // Use order.tenantId instead of id
					data: { SMSBalance: { increment: order.credits } },
				})
			}
		}

		return { success: true, order }
	} catch (error) {
		console.error('Error updating order status:', error)
		return { success: false, error: JSON.parse(JSON.stringify(error)) }
	}
}

export async function createSMSSettings(data: any) {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId

	if (!tenantId) {
		throw new Error('No tenant ID found')
	}

	const prisma = await getSubdomainDB()
	try {
		const settings = await prisma.sMSNotificationConfig.create({
			data: {
				...data,
				tenantId,
			},
		})
		return JSON.parse(JSON.stringify(settings))
	} catch (error) {
		throw error // Let the client handle the error
	}
}

export async function getSMSSettings(tenantId: string) {
	if (!tenantId) {
		throw new Error('No tenant ID found')
	}

	const prisma = await getSubdomainDB()
	try {
		const settings = await prisma.sMSNotificationConfig.findFirst({
			where: { tenantId },
		})
		return settings ? JSON.parse(JSON.stringify(settings)) : null
	} catch (error) {
		throw error
	}
}

export async function updateSMSSettings(id: string, settings: any) {
	const prisma = await getSubdomainDB()
	try {
		const updated = await prisma.sMSNotificationConfig.update({
			where: { id },
			data: {
				settings,
				updatedAt: new Date(),
			},
		})
		return JSON.parse(JSON.stringify(updated))
	} catch (error) {
		throw error
	}
}
