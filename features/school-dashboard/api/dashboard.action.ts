'use server'

import { prisma } from '@/lib/db'
import type {
	DashboardStats,
	TimePeriod,
	TimeSeriesData,
	AccountBalance,
} from '@/features/school-dashboard/types'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CACHE_KEYS } from '@/constants/cache'
import { EmployeeStatus, EmployeeStatusSchema } from '@/lib/zod'

export async function getDashboardStats(
	tenantId: string,
): Promise<DashboardStats> {
	try {
		// Get current date ranges
		const now = new Date()
		const startOfToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		)
		const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

		// BATCH 1: Financial data queries
		const [
			todayIncome,
			weekIncome,
			monthIncome,
			lastMonthIncome,
			todayExpense,
			weekExpense,
			monthExpense,
		] = await Promise.all([
			prisma.studentPayment.aggregate({
				where: { tenantId, createdAt: { gte: startOfToday } },
				_sum: { amount: true },
			}),
			prisma.studentPayment.aggregate({
				where: { tenantId, createdAt: { gte: startOfWeek } },
				_sum: { amount: true },
			}),
			prisma.studentPayment.aggregate({
				where: { tenantId, createdAt: { gte: startOfMonth } },
				_sum: { amount: true },
			}),
			prisma.studentPayment.aggregate({
				where: {
					tenantId,
					createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
				},
				_sum: { amount: true },
			}),
			prisma.tenantTransaction.aggregate({
				where: { tenantId, type: 'EXPENSE', createdAt: { gte: startOfToday } },
				_sum: { amount: true },
			}),
			prisma.tenantTransaction.aggregate({
				where: { tenantId, type: 'EXPENSE', createdAt: { gte: startOfWeek } },
				_sum: { amount: true },
			}),
			prisma.tenantTransaction.aggregate({
				where: { tenantId, type: 'EXPENSE', createdAt: { gte: startOfMonth } },
				_sum: { amount: true },
			}),
		])

		// BATCH 2: Dues and accounts
		const [totalDues, totalWaivers, accountBalances] = await Promise.all([
			prisma.dueItem.aggregate({
				where: { tenantId, status: 'PENDING' },
				_sum: { finalAmount: true, paidAmount: true },
			}),
			prisma.dueAdjustment.aggregate({
				where: { tenantId, type: 'DISCOUNT', status: 'ACTIVE' },
				_sum: { amount: true },
			}),
			prisma.tenantAccount.findMany({
				where: { tenantId },
				select: {
					id: true,
					title: true,
					balance: true,
					type: true,
					updatedAt: true,
				},
			}),
		])

		// BATCH 3: Student and teacher counts
		const [totalStudents, activeStudents, newAdmissions, totalTeachers] =
			await Promise.all([
				prisma.student.count({
					where: { tenantId, status: 'ACTIVE' },
				}),
				prisma.student.count({
					where: {
						tenantId,
						status: 'ACTIVE',
						attendances: {
							some: {
								createdAt: {
									gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
								},
							},
						},
					},
				}),
				prisma.student.count({
					where: {
						tenantId,
						status: 'ACTIVE',
						admissionDate: { gte: startOfMonth },
					},
				}),
				prisma.tenantEmployee.count({
					where: { tenantId, status: EmployeeStatusSchema.enum.ACTIVE },
				}),
			])

		// BATCH 4: Class summary and time series data (sequential to avoid overload)
		const classSummary = await getClassSummaryWithFees(tenantId)

		// Get time series data sequentially to reduce connection pressure
		const dailyData = await getDailyComparison(tenantId)
		const weeklyData = await getWeeklyComparison(tenantId)
		const monthlyData = await getMonthlyComparison(tenantId)

		// Calculate metrics
		const finalAmount = totalDues._sum.finalAmount
			? Number(totalDues._sum.finalAmount)
			: 0
		const paidAmount = totalDues._sum.paidAmount
			? Number(totalDues._sum.paidAmount)
			: 0
		const outstandingDues = finalAmount - paidAmount

		const currentMonthIncome = Number(monthIncome._sum.amount || 0)
		const lastMonthIncomeAmount = Number(lastMonthIncome._sum.amount || 0)
		const monthlyGrowth =
			lastMonthIncomeAmount > 0
				? Math.round(
						((currentMonthIncome - lastMonthIncomeAmount) /
							lastMonthIncomeAmount) *
							100,
					)
				: 0

		const totalAccountBalance = accountBalances.reduce(
			(sum, acc) => sum + Number(acc.balance),
			0,
		)
		const collectionRate =
			finalAmount > 0 ? Math.round((paidAmount / finalAmount) * 100) : 100

		return {
			payment: {
				todayIncome: Number(todayIncome._sum.amount || 0),
				weekIncome: Number(weekIncome._sum.amount || 0),
				monthIncome: currentMonthIncome,
				todayExpense: Number(todayExpense._sum.amount || 0),
				weekExpense: Number(weekExpense._sum.amount || 0),
				monthExpense: Number(monthExpense._sum.amount || 0),
				totalDues: outstandingDues,
				totalWaivers: Number(totalWaivers._sum.amount || 0),
				totalAccountBalance,
				accountBalances: accountBalances.map(acc => ({
					id: acc.id,
					title: acc.title,
					balance: Number(acc.balance),
					type: acc.type as any,
					lastUpdated: acc.updatedAt.toISOString(),
				})),
				dailyComparison: dailyData,
				weeklyComparison: weeklyData,
				monthlyComparison: monthlyData,
				monthlyGrowth,
				weeklyGrowth: 15,
				collectionRate,
			},
			academic: {
				totalStudents,
				totalTeachers,
				activeStudents,
				newAdmissions,
				classSummary,
				studentGrowth: 3,
				attendanceRate:
					activeStudents > 0
						? Math.round((activeStudents / totalStudents) * 100)
						: 0,
			},
		}
	} catch (error) {
		console.error('Error fetching dashboard stats:', error)
		throw new Error('Failed to fetch dashboard statistics')
	}
}

async function getClassSummaryWithFees(tenantId: string) {
	const classes = await prisma.class.findMany({
		where: { tenantId },
		include: {
			_count: {
				select: {
					students: {
						where: { status: 'ACTIVE' },
					},
					sections: true,
				},
			},
			students: {
				where: { status: 'ACTIVE' },
				include: {
					studentDues: {
						include: {
							dueItems: {
								where: { status: { in: ['PENDING', 'PAID'] } },
							},
						},
					},
				},
			},
		},
		orderBy: { name: 'asc' },
	})

	return classes.map(cls => {
		const totalFees = cls.students.reduce(
			(sum, student) =>
				sum +
				student.studentDues.reduce(
					(dueSum, due) =>
						dueSum +
						due.dueItems.reduce(
							(itemSum, item) => itemSum + Number(item.finalAmount),
							0,
						),
					0,
				),
			0,
		)

		const collectedFees = cls.students.reduce(
			(sum, student) =>
				sum +
				student.studentDues.reduce(
					(dueSum, due) =>
						dueSum +
						due.dueItems.reduce(
							(itemSum, item) => itemSum + Number(item.paidAmount),
							0,
						),
					0,
				),
			0,
		)

		return {
			className: cls.name,
			studentCount: cls._count.students,
			sectionCount: cls._count.sections,
			totalFees,
			collectedFees,
			pendingFees: totalFees - collectedFees,
		}
	})
}

async function getDailyComparison(tenantId: string): Promise<TimeSeriesData[]> {
	const days = []
	const now = new Date()

	for (let i = 29; i >= 0; i--) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)
		const nextDay = new Date(date)
		nextDay.setDate(nextDay.getDate() + 1)

		const [income, expense] = await Promise.all([
			prisma.studentPayment.aggregate({
				where: {
					tenantId,
					createdAt: {
						gte: date,
						lt: nextDay,
					},
				},
				_sum: { amount: true },
			}),
			prisma.tenantTransaction.aggregate({
				where: {
					tenantId,
					type: 'EXPENSE',
					createdAt: {
						gte: date,
						lt: nextDay,
					},
				},
				_sum: { amount: true },
			}),
		])

		const incomeAmount = Number(income._sum.amount || 0)
		const expenseAmount = Number(expense._sum.amount || 0)

		days.push({
			period: date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			}),
			income: incomeAmount,
			expense: expenseAmount,
			net: incomeAmount - expenseAmount,
		})
	}

	return days
}

async function getWeeklyComparison(
	tenantId: string,
): Promise<TimeSeriesData[]> {
	const weeks = []
	const now = new Date()

	for (let i = 11; i >= 0; i--) {
		const weekStart = new Date(now)
		weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay())
		const weekEnd = new Date(weekStart)
		weekEnd.setDate(weekEnd.getDate() + 7)

		const [income, expense] = await Promise.all([
			prisma.studentPayment.aggregate({
				where: {
					tenantId,
					createdAt: {
						gte: weekStart,
						lt: weekEnd,
					},
				},
				_sum: { amount: true },
			}),
			prisma.tenantTransaction.aggregate({
				where: {
					tenantId,
					type: 'EXPENSE',
					createdAt: {
						gte: weekStart,
						lt: weekEnd,
					},
				},
				_sum: { amount: true },
			}),
		])

		const incomeAmount = Number(income._sum.amount || 0)
		const expenseAmount = Number(expense._sum.amount || 0)

		weeks.push({
			period: `Week ${12 - i}`,
			income: incomeAmount,
			expense: expenseAmount,
			net: incomeAmount - expenseAmount,
		})
	}

	return weeks
}

async function getMonthlyComparison(
	tenantId: string,
): Promise<TimeSeriesData[]> {
	const months = []
	const now = new Date()

	for (let i = 11; i >= 0; i--) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
		const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

		const [income, expense] = await Promise.all([
			prisma.studentPayment.aggregate({
				where: {
					tenantId,
					createdAt: {
						gte: date,
						lt: nextMonth,
					},
				},
				_sum: { amount: true },
			}),
			prisma.tenantTransaction.aggregate({
				where: {
					tenantId,
					type: 'EXPENSE',
					createdAt: {
						gte: date,
						lt: nextMonth,
					},
				},
				_sum: { amount: true },
			}),
		])

		const incomeAmount = Number(income._sum.amount || 0)
		const expenseAmount = Number(expense._sum.amount || 0)

		months.push({
			period: date.toLocaleDateString('en-US', { month: 'short' }),
			income: incomeAmount,
			expense: expenseAmount,
			net: incomeAmount - expenseAmount,
		})
	}

	return months
}

export async function getCachedDashboardStats(tenantId: string) {
	return await nextjsCacheService.cached(() => getDashboardStats(tenantId), {
		key: CACHE_KEYS.TENANT_DASHBOARD.KEY(tenantId),
		tags: [CACHE_KEYS.TENANT_DASHBOARD.TAG(tenantId)],
		revalidate: 600, // 10 minutes
	})
}
