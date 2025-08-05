'use server'

import { auth } from '@/auth'
import { getTenantId } from '@/lib/tenant'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import {
	getExamResultsService,
	getResultStatisticsService,
	publishResultsService,
	unpublishResultsService,
	updateComponentResultService,
} from '../services/result.service'

// Publish results for an exam schedule
export async function publishResults(examScheduleId: string) {
	try {
		const tenantId = await getTenantId()
		const session = await auth()

		if (!session?.user) {
			return {
				success: false,
				error: 'Unauthorized. Please log in to continue.',
			}
		}

		const result = await publishResultsService({
			examScheduleId,
			publishedBy: session.user.name || session.user.email || 'Unknown',
			tenantId,
			notifyStudents: false, // Can be made configurable
			notifyParents: false, // Can be made configurable
		})

		return {
			success: true,
			message: 'Results published successfully',
			data: result,
		}
	} catch (error: any) {
		console.error('Error publishing results:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}

// Unpublish results for an exam schedule
export async function unpublishResults(examScheduleId: string) {
	try {
		const session = await auth()

		if (!session?.user) {
			return {
				success: false,
				error: 'Unauthorized. Please log in to continue.',
			}
		}

		const result = await unpublishResultsService(
			examScheduleId,
			session.user.name || session.user.email || 'Unknown',
		)

		return {
			success: true,
			message: 'Results unpublished successfully',
			data: result,
		}
	} catch (error: any) {
		console.error('Error unpublishing results:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}

// Get result statistics for an exam schedule
export async function getResultStatistics(examScheduleId: string) {
	try {
		const tenantId = await getTenantId()
		const statistics = await getResultStatisticsService(examScheduleId)

		return {
			success: true,
			data: statistics,
		}
	} catch (error: any) {
		console.error('Error fetching result statistics:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}

// Get exam results with detailed information
export async function getExamResults(
	examScheduleId: string,
	includeUnpublished: boolean = false,
) {
	try {
		const results = await getExamResultsService(
			examScheduleId,
			includeUnpublished,
		)

		return {
			success: true,
			data: results,
		}
	} catch (error: any) {
		console.error('Error fetching exam results:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}

// Update individual component result (for corrections)
export async function updateComponentResult(
	componentResultId: string,
	newMarks: number,
	remarks?: string,
) {
	try {
		const session = await auth()

		if (!session?.user) {
			return {
				success: false,
				error: 'Unauthorized. Please log in to continue.',
			}
		}

		const result = await updateComponentResultService(
			componentResultId,
			newMarks,
			session.user.id || session.user.email || 'Unknown',
			remarks,
		)

		return {
			success: true,
			message: 'Result updated successfully',
			data: result,
		}
	} catch (error: any) {
		console.error('Error updating component result:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}

// Get students for a specific exam (based on class/section)
export async function getStudentsForExam(classId: string, sectionId?: string) {
	try {
		const tenantId = await getTenantId()

		// Import prisma here to avoid top-level imports in server actions
		const { prisma } = await import('@/lib/db')

		const whereClause: any = {
			classId,
			tenantId,
			status: 'ACTIVE',
		}

		if (sectionId) {
			whereClause.sectionId = sectionId
		}

		console.error('whereClause: ', whereClause)

		const students = await prisma.student.findMany({
			// where: whereClause,
			select: {
				id: true,
				name: true,
				roll: true,
				photo: true,
				studentId: true,
			},
			orderBy: {
				roll: 'asc',
			},
		})

		return {
			success: true,
			data: students,
		}
	} catch (error: any) {
		console.error('Error fetching students for exam:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}

// Get existing results for an exam schedule
export async function getExistingResultsForEntry(examScheduleId: string) {
	try {
		const tenantId = await getTenantId()

		// Import prisma here to avoid top-level imports in server actions
		const { prisma } = await import('@/lib/db')

		const results = await prisma.examResult.findMany({
			where: {
				examScheduleId,
				tenantId,
			},
			include: {
				componentResults: {
					select: {
						id: true,
						examComponentId: true,
						obtainedMarks: true,
						isAbsent: true,
						remarks: true,
					},
				},
				student: {
					select: {
						id: true,
						name: true,
						roll: true,
					},
				},
			},
		})

		// Transform to match the expected format
		const transformedResults = results.map(result => ({
			studentId: result.studentId,
			componentResults: result.componentResults.map(cr => ({
				examComponentId: cr.examComponentId,
				obtainedMarks: cr.obtainedMarks,
				isAbsent: cr.isAbsent,
				remarks: cr.remarks,
			})),
		}))

		return {
			success: true,
			data: transformedResults,
		}
	} catch (error: any) {
		console.error('Error fetching existing results:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}

// Validate exam schedule for result entry
export async function validateExamScheduleForEntry(examScheduleId: string) {
	try {
		const tenantId = await getTenantId()

		// Import prisma here to avoid top-level imports in server actions
		const { prisma } = await import('@/lib/db')

		const examSchedule = await prisma.examSchedule.findUnique({
			where: {
				id: examScheduleId,
				tenantId,
			},
			include: {
				exam: {
					select: {
						title: true,
						startDate: true,
						endDate: true,
					},
				},
				components: {
					select: {
						id: true,
						name: true,
						maxMarks: true,
					},
				},
				class: {
					select: {
						name: true,
					},
				},
				section: {
					select: {
						name: true,
					},
				},
				subject: {
					select: {
						name: true,
					},
				},
			},
		})

		if (!examSchedule) {
			return {
				success: false,
				error: 'Exam schedule not found',
			}
		}

		if (!examSchedule.components || examSchedule.components.length === 0) {
			return {
				success: false,
				error:
					'No exam components found. Please configure exam components before entering results.',
			}
		}

		// Check if exam date has passed (optional validation)
		const currentDate = new Date()
		if (examSchedule.date > currentDate) {
			return {
				success: false,
				error: 'Cannot enter results for future exams.',
				warning: true, // This could be treated as a warning instead of error
			}
		}

		return {
			success: true,
			data: examSchedule,
		}
	} catch (error: any) {
		console.error('Error validating exam schedule:', error)
		return {
			success: false,
			error: cleanErrorMessage(error),
		}
	}
}
