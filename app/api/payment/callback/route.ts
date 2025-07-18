import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import bkashAuth from '@/utils/bkashAuth'
import bkashHeaders from '@/utils/bkashHeaders'
import { prisma } from '@/lib/db'
import { createPayment } from '@/lib/actions/payment.action'
import { extractSubdomain } from '@/utils/extract-subdomain'

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const hostname = req.headers.get('host') || ''
		const subdomain = extractSubdomain(hostname)

		// Determine base URL with subdomain if present
		const baseUrl = subdomain
			? `${req.nextUrl.protocol}//${hostname}`
			: req.nextUrl.origin

		const token = await bkashAuth(req)
		const paymentID = searchParams.get('paymentID')
		const status = searchParams.get('status')
		const tenantId = searchParams.get('tenantId')
		const reason = searchParams.get('reason')

		if (!tenantId) {
			throw new Error('Tenant ID is required')
		}

		const tenant = await prisma.tenant.findUnique({
			where: { id: tenantId },
		})

		if (!tenant) {
			throw new Error('Tenant not found')
		}

		// Handle cancellation or failure
		if (status === 'cancel' || status === 'failure') {
			return NextResponse.redirect(
				`${baseUrl}/institution/${tenant.domain}?payment_status=failed`,
			)
		}

		// Execute payment with bKash
		const { data } = await axios.post(
			process.env.bkash_execute_payment_url as string,
			{ paymentID },
			{ headers: bkashHeaders(token) },
		)

		// Check if payment was successful
		if (data?.statusCode === '0000') {
			const paymentData = {
				tenantId: tenant.id,
				tenantName: tenant.name,
				paymentStatus: 'completed',
				paymentMethod: 'bkash',
				bkashNumber: data.customerMsisdn,
				paymentID: paymentID as string,
				transactionId: data.trxID,
				reason: reason as string,
				amount: parseInt(data.amount),
			}

			// Create payment record
			await createPayment(paymentData)

			// Update billing schedule
			await updateBillingScheduleAfterPayment(tenantId, reason as string)

			return NextResponse.redirect(
				`${baseUrl}/institution/${tenant.domain}/admin?payment_status=success`,
			)
		}

		// If payment wasn't successful
		return NextResponse.redirect(
			`${baseUrl}/institution/${tenant.domain}?payment_status=failed`,
		)
	} catch (error) {
		console.error('Payment callback error:', error)
		const hostname = req.headers.get('host') || ''
		const subdomain = extractSubdomain(hostname)
		const baseUrl = subdomain
			? `${req.nextUrl.protocol}//${hostname}`
			: req.nextUrl.origin

		return NextResponse.redirect(
			`${baseUrl}/error?message=Payment processing failed`,
		)
	}
}

async function updateBillingScheduleAfterPayment(
	tenantId: string,
	reason: string,
) {
	try {
		const schedule = await prisma.tenantBillingSchedule.findFirst({
			where: {
				tenantId,
				label: reason,
				status: 'ACTIVE',
			},
		})

		if (!schedule) return

		if (schedule.frequency === 'ONE_TIME') {
			await prisma.tenantBillingSchedule.update({
				where: { id: schedule.id },
				data: { status: 'INACTIVE' },
			})
			return
		}

		const currentDate = new Date()
		let nextDueDate = new Date(currentDate)

		if (schedule.frequency === 'MONTHLY') {
			nextDueDate.setMonth(currentDate.getMonth() + 1)
		} else if (schedule.frequency === 'YEARLY') {
			nextDueDate.setFullYear(currentDate.getFullYear() + 1)
		}

		await prisma.tenantBillingSchedule.update({
			where: { id: schedule.id },
			data: { nextDueDate },
		})
	} catch (error) {
		console.error('Error updating billing schedule:', error)
		throw error
	}
}
