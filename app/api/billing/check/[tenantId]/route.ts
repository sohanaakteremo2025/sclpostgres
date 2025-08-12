// app/api/billing/check/[tenantId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { billingCache } from '@/lib/billing/billing-cache'
import { auth } from '@/auth'

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ tenantId: string }> },
) {
	try {
		// Verify authentication
		const session = await auth()
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { tenantId } = await params

		// Validate tenantId
		if (!tenantId || tenantId.trim() === '') {
			return NextResponse.json({ error: 'Invalid tenant ID' }, { status: 400 })
		}

		// Check cache first
		const cacheKey = `billing:${tenantId}`
		const cached = billingCache.get(cacheKey)

		if (cached) {
			return NextResponse.json(cached)
		}

		// Fetch from database
		const billingSchedules = await prisma.tenantBillingSchedule.findMany({
			where: {
				tenantId,
				status: 'ACTIVE',
			},
			select: {
				id: true,
				label: true,
				amount: true,
				nextDueDate: true,
				frequency: true,
				billingType: true,
			},
			orderBy: {
				nextDueDate: 'asc',
			},
		})

		// If no billing schedules exist, return default status
		if (!billingSchedules || billingSchedules.length === 0) {
			const defaultStatus = {
				isOverdue: false,
				daysOverdue: 0,
				overdueSchedules: [],
				totalOverdueAmount: 0,
			}
			
			// Cache the result
			billingCache.set(cacheKey, defaultStatus)
			
			return NextResponse.json(defaultStatus)
		}

		const now = new Date()
		const overdueSchedules = billingSchedules
			.filter(schedule => schedule.nextDueDate < now)
			.map(schedule => {
				const daysOverdue = Math.ceil(
					(now.getTime() - schedule.nextDueDate.getTime()) /
						(1000 * 60 * 60 * 24),
				)
				return {
					id: schedule.id,
					label: schedule.label,
					amount: Number(schedule.amount),
					nextDueDate: schedule.nextDueDate,
					daysOverdue,
				}
			})

		const totalOverdueAmount = overdueSchedules.reduce(
			(total, schedule) => total + schedule.amount,
			0,
		)

		const billingStatus = {
			isOverdue: overdueSchedules.length > 0,
			daysOverdue:
				overdueSchedules.length > 0
					? Math.max(...overdueSchedules.map(s => s.daysOverdue))
					: 0,
			overdueSchedules,
			totalOverdueAmount,
		}

		// Cache the result
		billingCache.set(cacheKey, billingStatus)

		return NextResponse.json(billingStatus)
	} catch (error) {
		console.error('Error checking billing status:', error)
		return NextResponse.json(
			{ error: 'Failed to check billing status' },
			{ status: 500 },
		)
	}
}
