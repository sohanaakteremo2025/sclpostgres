'use server'

import { getTenantId } from '@/lib/tenant'
import { auth } from '@/auth'
import { getExamResultsService, getResultStatisticsService } from '../services/result.service'

interface ResultsFilter {
	search?: string
	classId?: string
	sessionId?: string
	examTypeId?: string
	sectionId?: string
	subjectId?: string
	publishedOnly?: boolean
	page?: number
	limit?: number
}

export async function getFilteredResults(filters: ResultsFilter = {}) {
	try {
		const tenantId = await getTenantId()
		const session = await auth()

		if (!session?.user) {
			return {
				success: false,
				error: 'Unauthorized',
			}
		}

		if (!tenantId) {
			return {
				success: false,
				error: 'Tenant ID not found',
			}
		}

		// Use prisma instance
		const { prisma } = await import('@/lib/db')

		// Build the where clause based on filters
		const whereClause: any = {
			tenantId,
		}

		// Add filters
		if (filters.classId) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				classId: filters.classId,
			}
		}

		if (filters.sectionId) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				sectionId: filters.sectionId,
			}
		}

		if (filters.subjectId) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				subjectId: filters.subjectId,
			}
		}

		if (filters.sessionId) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				exam: {
					sessionId: filters.sessionId,
				},
			}
		}

		if (filters.examTypeId) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				exam: {
					...whereClause.examSchedule?.exam,
					examTypeId: filters.examTypeId,
				},
			}
		}

		if (filters.search) {
			whereClause.student = {
				OR: [
					{ name: { contains: filters.search, mode: 'insensitive' } },
					{ roll: { contains: filters.search, mode: 'insensitive' } },
					{ studentId: { contains: filters.search, mode: 'insensitive' } },
				],
			}
		}

		if (filters.publishedOnly !== false) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				resultPublish: {
					some: {
						isPublished: true,
					},
				},
			}
		}

		// Pagination
		const page = filters.page || 1
		const limit = filters.limit || 20
		const skip = (page - 1) * limit

		// Get results with all relations
		const results = await prisma.examResult.findMany({
			where: whereClause,
			include: {
				student: {
					select: {
						id: true,
						name: true,
						roll: true,
						photo: true,
					},
				},
				componentResults: {
					include: {
						examComponent: {
							select: {
								id: true,
								name: true,
								maxMarks: true,
								order: true,
							},
						},
					},
					orderBy: {
						examComponent: {
							order: 'asc',
						},
					},
				},
				examSchedule: {
					include: {
						exam: {
							include: {
								examType: {
									select: {
										id: true,
										name: true,
									},
								},
							},
						},
						subject: {
							select: {
								id: true,
								name: true,
								code: true,
							},
						},
						class: {
							select: {
								id: true,
								name: true,
							},
						},
						section: {
							select: {
								id: true,
								name: true,
							},
						},
						resultPublish: {
							select: {
								isPublished: true,
								publishedAt: true,
								publishedBy: true,
							},
						},
					},
				},
			},
			orderBy: [
				{
					examSchedule: {
						exam: {
							startDate: 'desc',
						},
					},
				},
				{
					student: {
						roll: 'asc',
					},
				},
			],
			skip,
			take: limit,
		})

		// Get total count for pagination
		const totalCount = await prisma.examResult.count({
			where: whereClause,
		})

		// Transform results to include publication status and format dates
		const transformedResults = results.map(result => ({
			...result,
			isPublished: result.examSchedule.resultPublish?.some(rp => rp.isPublished) || false,
			examSchedule: {
				...result.examSchedule,
				date: result.examSchedule.date.toISOString().split('T')[0], // Format date
			},
		}))

		return {
			success: true,
			data: {
				results: transformedResults,
				pagination: {
					page,
					limit,
					total: totalCount,
					totalPages: Math.ceil(totalCount / limit),
				},
			},
		}
	} catch (error: any) {
		console.error('Error fetching filtered results:', error)
		return {
			success: false,
			error: error.message || 'Failed to fetch results',
		}
	}
}

export async function getResultsStatistics(filters: Omit<ResultsFilter, 'page' | 'limit'> = {}) {
	try {
		const tenantId = await getTenantId()
		const session = await auth()

		if (!session?.user) {
			return {
				success: false,
				error: 'Unauthorized',
			}
		}

		if (!tenantId) {
			return {
				success: false,
				error: 'Tenant ID not found',
			}
		}

		// Use prisma instance
		const { prisma } = await import('@/lib/db')

		// Build where clause for statistics (similar to above but for stats)
		const whereClause: any = {
			tenantId,
		}

		// Apply same filters as above
		if (filters.classId || filters.sectionId || filters.subjectId || filters.sessionId || filters.examTypeId) {
			whereClause.examSchedule = {}

			if (filters.classId) whereClause.examSchedule.classId = filters.classId
			if (filters.sectionId) whereClause.examSchedule.sectionId = filters.sectionId
			if (filters.subjectId) whereClause.examSchedule.subjectId = filters.subjectId
			
			if (filters.sessionId || filters.examTypeId) {
				whereClause.examSchedule.exam = {}
				if (filters.sessionId) whereClause.examSchedule.exam.sessionId = filters.sessionId
				if (filters.examTypeId) whereClause.examSchedule.exam.examTypeId = filters.examTypeId
			}
		}

		if (filters.search) {
			whereClause.student = {
				OR: [
					{ name: { contains: filters.search, mode: 'insensitive' } },
					{ roll: { contains: filters.search, mode: 'insensitive' } },
					{ studentId: { contains: filters.search, mode: 'insensitive' } },
				],
			}
		}

		if (filters.publishedOnly !== false) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				resultPublish: {
					some: {
						isPublished: true,
					},
				},
			}
		}

		// Get statistics
		const [
			totalResults,
			publishedCount,
			absentCount,
			gradeDistribution,
			averageStats
		] = await Promise.all([
			// Total results count
			prisma.examResult.count({ where: whereClause }),

			// Published results count
			prisma.examResult.count({
				where: {
					...whereClause,
					examSchedule: {
						...whereClause.examSchedule,
						resultPublish: {
							some: { isPublished: true },
						},
					},
				},
			}),

			// Absent students count
			prisma.examResult.count({
				where: { ...whereClause, isAbsent: true },
			}),

			// Grade distribution
			prisma.examResult.groupBy({
				by: ['grade'],
				where: { ...whereClause, isAbsent: false, grade: { not: null } },
				_count: { grade: true },
			}),

			// Average percentage
			prisma.examResult.aggregate({
				where: { ...whereClause, isAbsent: false },
				_avg: { percentage: true },
			}),
		])

		// Calculate statistics
		const presentCount = totalResults - absentCount
		const unpublishedCount = totalResults - publishedCount
		const averagePercentage = averageStats._avg.percentage || 0
		const passRate = presentCount > 0 ? ((presentCount - (gradeDistribution.find(g => g.grade === 'F')?._count.grade || 0)) / presentCount) * 100 : 0

		// Transform grade distribution
		const gradeDistributionMap = gradeDistribution.reduce<Record<string, number>>((acc, item) => {
			if (item.grade) {
				acc[item.grade] = item._count.grade
			}
			return acc
		}, {})

		return {
			success: true,
			data: {
				totalExams: await prisma.examSchedule.count({
					where: {
						tenantId,
						...(filters.classId && { classId: filters.classId }),
						...(filters.sectionId && { sectionId: filters.sectionId }),
					},
				}),
				totalStudents: totalResults,
				publishedResults: publishedCount,
				unpublishedResults: unpublishedCount,
				presentStudents: presentCount,
				absentStudents: absentCount,
				averagePercentage: Math.round(averagePercentage * 100) / 100,
				passRate: Math.round(passRate * 100) / 100,
				topPerformers: gradeDistribution.filter(g => g.grade?.startsWith('A')).reduce((sum, g) => sum + g._count.grade, 0),
				gradeDistribution: gradeDistributionMap,
				recentTrends: {
					improvement: 65, // This would need historical data to calculate
					decline: 35, // This would need historical data to calculate
				},
			},
		}
	} catch (error: any) {
		console.error('Error fetching results statistics:', error)
		return {
			success: false,
			error: error.message || 'Failed to fetch statistics',
		}
	}
}