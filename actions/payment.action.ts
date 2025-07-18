'use server'

import { prisma } from '@/lib/db'
import { invalidateTenantBillingCache } from '@/lib/billing/billing-client'

// Update your existing createPayment function to invalidate cache
export async function createPayment(paymentData: {
	tenantId: string
	tenantName: string
	paymentStatus: string
	paymentMethod: string
	bkashNumber: string
	paymentID: string
	transactionId: string
	reason: string
	amount: number
}) {
	try {
		// Create payment record
		const result = await prisma.tenantBilling.create({
			data: {
				tenantId: paymentData.tenantId,
				method: 'BKASH',
				amount: paymentData.amount,
				trxId: paymentData.transactionId,
				reason: paymentData.reason,
			},
		})

		// Invalidate billing cache after payment
		await invalidateTenantBillingCache(paymentData.tenantId)

		return result
	} catch (error) {
		console.error('Error creating payment:', error)
		throw error
	}
}

// Update your existing updateNextPaymentDate function
export async function updateNextPaymentDate(
	tenantId: string,
	updates: {
		nextPaymentDate?: string
		nextDomainRenewDate?: string
	},
) {
	try {
		// Find the billing schedule based on the reason
		const schedules = await prisma.tenantBillingSchedule.findMany({
			where: {
				tenantId,
				status: 'ACTIVE',
			},
		})

		// Update the next due date for relevant schedules
		const updatePromises = schedules.map(schedule => {
			// Calculate next due date based on frequency
			const currentDate = new Date()
			let nextDueDate: Date

			if (schedule.frequency === 'MONTHLY') {
				nextDueDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
			} else if (schedule.frequency === 'YEARLY') {
				nextDueDate = new Date(
					currentDate.getTime() + 365 * 24 * 60 * 60 * 1000,
				) // 365 days
			} else {
				// For ONE_TIME, you might want to deactivate the schedule
				return prisma.tenantBillingSchedule.update({
					where: { id: schedule.id },
					data: { status: 'INACTIVE' },
				})
			}

			return prisma.tenantBillingSchedule.update({
				where: { id: schedule.id },
				data: { nextDueDate },
			})
		})

		const results = await Promise.all(updatePromises)

		// Invalidate cache after updating schedules
		await invalidateTenantBillingCache(tenantId)

		return results
	} catch (error) {
		console.error('Error updating payment date:', error)
		throw error
	}
}

// New function to update specific schedule
export async function updateBillingSchedule(
	scheduleId: string,
	tenantId: string,
	nextDueDate: string,
) {
	try {
		const result = await prisma.tenantBillingSchedule.update({
			where: { id: scheduleId },
			data: { nextDueDate: new Date(nextDueDate) },
		})

		// Invalidate cache after updating schedule
		await invalidateTenantBillingCache(tenantId)

		return result
	} catch (error) {
		console.error('Error updating billing schedule:', error)
		throw error
	}
}
