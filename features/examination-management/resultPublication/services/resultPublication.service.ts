import { resultPublicationDB, examResultDB } from '../db/resultPublication.repository'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CACHE_KEYS } from '@/constants/cache'
import { prisma } from '@/lib/db'
import type {
	BulkResultEntryFormData,
	ResultPublicationFormData,
	ResultUpdateFormData,
	ResultPublicationFilters,
	StudentResultFilters,
	ClassResultFilters,
} from '../types'

// Service for handling result publication operations
export async function publishResultsService({
	data,
	tenantId,
}: {
	data: ResultPublicationFormData & {
		publishedBy: string
	}
	tenantId: string
}) {
	try {
		// Validate that results exist for the exam schedule
		const results = await examResultDB.findByExamScheduleId({
			examScheduleId: data.examScheduleId,
			includeUnpublished: true,
			tenantId,
		})

		if (results.length === 0) {
			throw new Error('No results found for this exam schedule')
		}

		// Check if there are any missing results
		const examSchedule = await resultPublicationDB.findByExamScheduleId(
			data.examScheduleId,
			tenantId,
		)

		if (!examSchedule) {
			throw new Error('Exam schedule not found')
		}

		// Get expected students count
		const expectedStudents = await prisma.student.count({
			where: {
				classId: examSchedule.examSchedule.classId,
				sectionId: examSchedule.examSchedule.sectionId || undefined,
				tenantId,
				status: 'ACTIVE',
			},
		})

		if (results.length < expectedStudents) {
			const missingCount = expectedStudents - results.length
			console.warn(
				`Warning: ${missingCount} students are missing results for this exam`,
			)
		}

		// Publish the results
		const resultPublication = await resultPublicationDB.upsertResultPublication({
			examScheduleId: data.examScheduleId,
			isPublished: true,
			publishedAt: new Date(),
			publishedBy: data.publishedBy,
			tenantId,
		})

		// TODO: Send notifications if requested
		if (data.notifyStudents || data.notifyParents) {
			console.log('Notifications would be sent here:', {
				notifyStudents: data.notifyStudents,
				notifyParents: data.notifyParents,
				examSchedule: examSchedule.examSchedule,
				resultsCount: results.length,
			})
		}

		// Invalidate cache
		await nextjsCacheService.invalidate([
			CACHE_KEYS.RESULT_PUBLICATIONS.TAG(tenantId),
			CACHE_KEYS.EXAM_RESULTS.TAG(tenantId),
		])

		return {
			resultPublication,
			publishedResultsCount: results.length,
			examSchedule: examSchedule.examSchedule,
		}
	} catch (error: any) {
		console.error('Error in publishResultsService:', error)
		throw new Error(`Failed to publish results: ${error.message}`)
	}
}

export async function unpublishResultsService({
	examScheduleId,
	unpublishedBy,
	tenantId,
}: {
	examScheduleId: string
	unpublishedBy: string
	tenantId: string
}) {
	try {
		const resultPublication = await resultPublicationDB.findByExamScheduleId(
			examScheduleId,
			tenantId,
		)

		if (!resultPublication || !resultPublication.isPublished) {
			throw new Error('Results are not published for this exam schedule')
		}

		await resultPublicationDB.upsertResultPublication({
			examScheduleId,
			isPublished: false,
			publishedAt: null,
			publishedBy: unpublishedBy,
			tenantId,
		})

		// Invalidate cache
		await nextjsCacheService.invalidate([
			CACHE_KEYS.RESULT_PUBLICATIONS.TAG(tenantId),
			CACHE_KEYS.EXAM_RESULTS.TAG(tenantId),
		])

		return { success: true, message: 'Results unpublished successfully' }
	} catch (error: any) {
		console.error('Error in unpublishResultsService:', error)
		throw new Error(`Failed to unpublish results: ${error.message}`)
	}
}

export async function enterBulkResultsService({
	data,
	enteredBy,
	tenantId,
}: {
	data: BulkResultEntryFormData
	enteredBy: string
	tenantId: string
}) {
	try {
		// Validate exam schedule exists
		const examSchedule = await prisma.examSchedule.findUnique({
			where: { id: data.examScheduleId },
			include: {
				components: true,
				class: true,
				section: true,
				subject: true,
			},
		})

		if (!examSchedule) {
			throw new Error('Exam schedule not found')
		}

		// Validate students exist
		const studentIds = data.results.map(r => r.studentId)
		const students = await prisma.student.findMany({
			where: {
				id: { in: studentIds },
				tenantId,
			},
			select: { id: true, name: true },
		})

		if (students.length !== studentIds.length) {
			throw new Error('One or more students not found')
		}

		// Validate component results
		const componentIds = examSchedule.components.map(c => c.id)
		const componentMap = new Map(
			examSchedule.components.map(c => [c.id, c.maxMarks]),
		)

		for (const result of data.results) {
			const student = students.find(s => s.id === result.studentId)
			
			// Validate all components are provided
			const providedComponents = new Set(
				result.componentResults.map(cr => cr.examComponentId),
			)
			const missingComponents = componentIds.filter(
				id => !providedComponents.has(id),
			)

			if (missingComponents.length > 0) {
				throw new Error(
					`Missing component results for student ${student?.name || 'Unknown'}`,
				)
			}

			// Validate marks range
			for (const componentResult of result.componentResults) {
				const maxMarks = componentMap.get(componentResult.examComponentId)
				if (!maxMarks) {
					throw new Error('Invalid component ID')
				}

				if (!componentResult.isAbsent) {
					if (
						componentResult.obtainedMarks < 0 ||
						componentResult.obtainedMarks > maxMarks
					) {
						throw new Error(
							`Marks for student ${student?.name || 'Unknown'} must be between 0 and ${maxMarks}`,
						)
					}
				}
			}
		}

		// Create bulk results
		const results = await examResultDB.createBulkResults({
			examScheduleId: data.examScheduleId,
			results: data.results,
			tenantId,
		})

		// Invalidate cache
		await nextjsCacheService.invalidate([
			CACHE_KEYS.RESULT_PUBLICATIONS.TAG(tenantId),
			CACHE_KEYS.EXAM_RESULTS.TAG(tenantId),
		])

		return results
	} catch (error: any) {
		console.error('Error in enterBulkResultsService:', error)
		throw new Error(`Failed to enter bulk results: ${error.message}`)
	}
}

export async function updateComponentResultService({
	data,
	updatedBy,
	tenantId,
}: {
	data: ResultUpdateFormData
	updatedBy: string
	tenantId: string
}) {
	try {
		const result = await examResultDB.updateComponentResult({
			id: data.componentResultId,
			obtainedMarks: data.obtainedMarks,
			remarks: data.remarks,
			updatedById: updatedBy,
			tenantId,
		})

		// Invalidate cache
		await nextjsCacheService.invalidate([
			CACHE_KEYS.RESULT_PUBLICATIONS.TAG(tenantId),
			CACHE_KEYS.EXAM_RESULTS.TAG(tenantId),
		])

		return result
	} catch (error: any) {
		console.error('Error in updateComponentResultService:', error)
		throw new Error(`Failed to update component result: ${error.message}`)
	}
}

export async function getResultPublicationsService({
	filters,
	tenantId,
	page = 1,
	limit = 50,
	orderBy,
}: {
	filters: ResultPublicationFilters
	tenantId: string
	page?: number
	limit?: number
	orderBy?: any[]
}) {
	try {
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			resultPublicationDB.findManyWithFilters({
				filters,
				tenantId,
				skip,
				take: limit,
				orderBy,
			}),
			resultPublicationDB.countWithFilters({
				filters,
				tenantId,
			}),
		])

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		}
	} catch (error: any) {
		console.error('Error in getResultPublicationsService:', error)
		throw new Error(`Failed to get result publications: ${error.message}`)
	}
}

export async function getExamResultsService({
	examScheduleId,
	includeUnpublished = false,
	tenantId,
}: {
	examScheduleId: string
	includeUnpublished?: boolean
	tenantId: string
}) {
	try {
		const results = await examResultDB.findByExamScheduleId({
			examScheduleId,
			includeUnpublished,
			tenantId,
		})

		return results
	} catch (error: any) {
		console.error('Error in getExamResultsService:', error)
		throw new Error(`Failed to get exam results: ${error.message}`)
	}
}

export async function getStudentResultsService({
	filters,
	tenantId,
}: {
	filters: StudentResultFilters
	tenantId: string
}) {
	try {
		const results = await examResultDB.findStudentResults({
			filters,
			tenantId,
		})

		return results
	} catch (error: any) {
		console.error('Error in getStudentResultsService:', error)
		throw new Error(`Failed to get student results: ${error.message}`)
	}
}

export async function getResultStatisticsService({
	examScheduleId,
	tenantId,
}: {
	examScheduleId: string
	tenantId: string
}) {
	try {
		const statistics = await examResultDB.getResultStatistics({
			examScheduleId,
			tenantId,
		})

		return statistics
	} catch (error: any) {
		console.error('Error in getResultStatisticsService:', error)
		throw new Error(`Failed to get result statistics: ${error.message}`)
	}
}

// Helper function to get unpublished exam schedules with results
export async function getUnpublishedExamSchedulesService({
	filters,
	tenantId,
}: {
	filters: {
		classId?: string
		sectionId?: string
		sessionId?: string
		subjectId?: string
	}
	tenantId: string
}) {
	try {
		// Find exam schedules that have results but are not published
		const whereClause: any = {
			tenantId,
			results: {
				some: {},
			},
			OR: [
				{
					resultPublish: {
						none: {},
					},
				},
				{
					resultPublish: {
						some: {
							isPublished: false,
						},
					},
				},
			],
		}

		if (filters.classId) {
			whereClause.classId = filters.classId
		}

		if (filters.sectionId) {
			whereClause.sectionId = filters.sectionId
		}

		if (filters.subjectId) {
			whereClause.subjectId = filters.subjectId
		}

		if (filters.sessionId) {
			whereClause.exam = {
				sessionId: filters.sessionId,
			}
		}

		const examSchedules = await prisma.examSchedule.findMany({
			where: whereClause,
			include: {
				exam: {
					include: {
						examType: true,
						session: true,
					},
				},
				class: true,
				section: true,
				subject: true,
				resultPublish: true,
				_count: {
					select: {
						results: true,
					},
				},
			},
			orderBy: [
				{
					exam: {
						startDate: 'desc',
					},
				},
				{
					date: 'desc',
				},
			],
		})

		return examSchedules
	} catch (error: any) {
		console.error('Error in getUnpublishedExamSchedulesService:', error)
		throw new Error(`Failed to get unpublished exam schedules: ${error.message}`)
	}
}