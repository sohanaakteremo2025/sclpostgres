'use server'

import { prisma } from '@/lib/db'
import { TenantStatus } from '@prisma/client'
import { createCachedAction } from '../cache-actions'
import { CACHE_KEYS } from '@/constants/cache'

export async function getDashboardData() {
	try {
		// Get tenant counts by status
		const tenantCounts = await prisma.tenant.groupBy({
			by: ['status'],
			_count: {
				id: true,
			},
		})

		// Format tenant counts
		const formattedTenantCounts: Record<TenantStatus, number> = {
			ACTIVE: 0,
			INACTIVE: 0,
			SUSPENDED: 0,
		}

		tenantCounts.forEach(item => {
			formattedTenantCounts[item.status] = item._count.id
		})

		// Get all tenants with their billing schedules
		const allTenants = await prisma.tenant.findMany({
			include: {
				billingSchedules: {
					where: {
						isActive: true,
					},
				},
			},
		})

		// Calculate pending payments
		const now = new Date()
		const pendingPayments = allTenants.filter(tenant => {
			const activeBilling = tenant.billingSchedules.find(bill => bill.isActive)
			return activeBilling && new Date(activeBilling.nextDueDate) < now
		}).length

		// Get total paid tenants (with billing > 0)
		const totalPaidTenants = allTenants.filter(tenant => {
			const activeBilling = tenant.billingSchedules.find(bill => bill.isActive)
			return (
				activeBilling &&
				((activeBilling.fixedAmount && Number(activeBilling.fixedAmount) > 0) ||
					(activeBilling.perStudentFee &&
						Number(activeBilling.perStudentFee) > 0))
			)
		}).length

		// Get current month's transactions
		const startOfMonth = new Date()
		startOfMonth.setDate(1)
		startOfMonth.setHours(0, 0, 0, 0)

		const endOfMonth = new Date()
		endOfMonth.setMonth(endOfMonth.getMonth() + 1)
		endOfMonth.setDate(0)
		endOfMonth.setHours(23, 59, 59, 999)

		const transactions = await prisma.companyTransaction.findMany({
			where: {
				createdAt: {
					gte: startOfMonth,
					lte: endOfMonth,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		// Calculate financial metrics
		const totalEarnings = transactions
			.filter(t => t.type === 'INCOME')
			.reduce((acc, t) => acc + Number(t.amount), 0)

		const totalExpenses = transactions
			.filter(t => t.type === 'EXPENSE')
			.reduce((acc, t) => acc + Number(t.amount), 0)

		const totalRevenue = totalEarnings - totalExpenses

		// Return the dashboard data
		return {
			tenantCounts: formattedTenantCounts,
			totalTenants: totalPaidTenants,
			pendingPayments,
			financials: {
				totalEarnings,
				totalExpenses,
				totalRevenue,
			},
			recentTransactions: transactions.slice(0, 5),
			allTransactions: transactions,
			allTenants,
		}
	} catch (error) {
		console.error('Error fetching dashboard data:', error)
		throw new Error('Failed to fetch dashboard data')
	}
}

export const cachedGetDashboardData = createCachedAction(getDashboardData, {
	cacheKey: CACHE_KEYS.DASHBOARD.KEY,
	tags: [CACHE_KEYS.DASHBOARD.TAG],
	revalidate: 3600, // 1 hour
})
