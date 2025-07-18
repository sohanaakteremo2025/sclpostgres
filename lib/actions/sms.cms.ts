'use server'
import { prisma } from '@/lib/db'
import { CACHE_KEYS, createCachedAction } from '../cache-actions'

export async function getSMSOrders() {
	try {
		const orders = await prisma.sMSOrder.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				tenant: {
					select: {
						id: true,
						name: true,
						domain: true,
					},
				},
			},
		})

		const formattedOrders = orders.map(order => ({
			id: order.id,
			tenantId: order.tenantId,
			tenantName: order.tenant.name,
			tenantDomain: order.tenant.domain,
			credits: order.credits,
			amount: order.amount.toString(),
			trxId: order.trxId,
			status: order.status,
			method: order.method,
			createdAt: order.createdAt,
			updatedAt: order.updatedAt,
		}))

		return formattedOrders
	} catch (error) {
		throw new Error('Failed to fetch SMS orders')
	}
}

export const getCachedSMSOrders = createCachedAction(getSMSOrders, {
	cacheKey: CACHE_KEYS.SMS_ORDERS.BASE,
	tags: [CACHE_KEYS.SMS_ORDERS.TAG],
	revalidate: 3600,
})

export async function updateSMSOrderStatus(
	id: string,
	status: 'APPROVED' | 'REJECTED',
) {
	try {
		const order = await prisma.$transaction(async tx => {
			const updatedOrder = await tx.sMSOrder.update({
				where: { id },
				data: { status },
			})

			// Use upsert instead of update - this will create a record if it doesn't exist
			await tx.sMSCredit.upsert({
				where: { tenantId: updatedOrder.tenantId },
				// If record exists, increment credits
				update: {
					credits: { increment: updatedOrder.credits },
				},
				// If record doesn't exist, create it with the credits value
				create: {
					tenantId: updatedOrder.tenantId,
					credits: updatedOrder.credits,
				},
			})

			return updatedOrder
		})

		return order
	} catch (error) {
		console.error('Transaction error:', error)
		throw new Error('Failed to update order status')
	}
}
