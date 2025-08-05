'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import {
	publishResultsService,
	unpublishResultsService,
	enterBulkResultsService,
	updateComponentResultService,
	getResultPublicationsService,
	getExamResultsService,
	getStudentResultsService,
	getResultStatisticsService,
} from '../services/resultPublication.service'
import { resultPublicationDB } from '../db/resultPublication.repository'
import {
	bulkResultEntrySchema,
	resultPublicationSchema,
	resultUpdateSchema,
	resultPublicationFiltersSchema,
	studentResultFiltersSchema,
	type BulkResultEntryFormData,
	type ResultPublicationFormData,
	type ResultUpdateFormData,
	type ResultPublicationFilters,
	type StudentResultFilters,
} from '../types'

// Result Publication Actions
export async function publishResults(data: ResultPublicationFormData) {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		// Validate data
		const validatedData = resultPublicationSchema.parse(data)

		const result = await publishResultsService({
			data: {
				...validatedData,
				publishedBy: session.user.id,
			},
			tenantId: session.user.tenantId,
		})

		// Revalidate paths
		revalidatePath('/admin/result-publication')
		revalidatePath('/admin/exam-schedules')
		revalidatePath('/admin/exam')

		return { success: true, data: result }
	} catch (error: any) {
		console.error('Error in publishResults:', error)
		return {
			success: false,
			error: error.message || 'Failed to publish results',
		}
	}
}

export async function unpublishResults(examScheduleId: string) {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const result = await unpublishResultsService({
			examScheduleId,
			unpublishedBy: session.user.id,
			tenantId: session.user.tenantId,
		})

		// Revalidate paths
		revalidatePath('/admin/result-publication')
		revalidatePath('/admin/exam-schedules')
		revalidatePath('/admin/exam')

		return { success: true, data: result }
	} catch (error: any) {
		console.error('Error in unpublishResults:', error)
		return {
			success: false,
			error: error.message || 'Failed to unpublish results',
		}
	}
}

// Result Entry Actions
export async function enterBulkResults(data: BulkResultEntryFormData) {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		// Validate data
		const validatedData = bulkResultEntrySchema.parse(data)

		const result = await enterBulkResultsService({
			data: validatedData,
			enteredBy: session.user.id,
			tenantId: session.user.tenantId,
		})

		// Revalidate paths
		revalidatePath('/admin/result-publication')
		revalidatePath('/admin/exam-schedules')

		return { success: true, data: result }
	} catch (error: any) {
		console.error('Error in enterBulkResults:', error)
		return {
			success: false,
			error: error.message || 'Failed to enter results',
		}
	}
}

export async function updateComponentResult(data: ResultUpdateFormData) {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		// Validate data
		const validatedData = resultUpdateSchema.parse(data)

		const result = await updateComponentResultService({
			data: validatedData,
			updatedBy: session.user.id,
			tenantId: session.user.tenantId,
		})

		// Revalidate paths
		revalidatePath('/admin/result-publication')
		revalidatePath('/admin/exam-schedules')

		return { success: true, data: result }
	} catch (error: any) {
		console.error('Error in updateComponentResult:', error)
		return {
			success: false,
			error: error.message || 'Failed to update result',
		}
	}
}

// Query Actions
export async function getResultPublications(
	filters: ResultPublicationFilters,
	page: number = 1,
	limit: number = 50,
) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		// Validate filters
		const validatedFilters = resultPublicationFiltersSchema.parse(filters)

		const result = await getResultPublicationsService({
			filters: validatedFilters,
			tenantId: session.user.tenantId,
			page,
			limit,
		})

		return { success: true, data: result }
	} catch (error: any) {
		console.error('Error in getResultPublications:', error)
		return {
			success: false,
			error: error.message || 'Failed to get result publications',
		}
	}
}

export async function getExamResults(
	examScheduleId: string,
	includeUnpublished: boolean = false,
) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const results = await getExamResultsService({
			examScheduleId,
			includeUnpublished,
			tenantId: session.user.tenantId,
		})

		return { success: true, data: results }
	} catch (error: any) {
		console.error('Error in getExamResults:', error)
		return {
			success: false,
			error: error.message || 'Failed to get exam results',
		}
	}
}

export async function getStudentResults(filters: StudentResultFilters) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		// Additional authorization check for student role
		if (
			session.user.role === 'STUDENT' &&
			session.user.id !== filters.studentId
		) {
			throw new Error('Unauthorized to view other student results')
		}

		// Validate filters
		const validatedFilters = studentResultFiltersSchema.parse(filters)

		const results = await getStudentResultsService({
			filters: validatedFilters,
			tenantId: session.user.tenantId,
		})

		return { success: true, data: results }
	} catch (error: any) {
		console.error('Error in getStudentResults:', error)
		return {
			success: false,
			error: error.message || 'Failed to get student results',
		}
	}
}

export async function getResultStatistics(examScheduleId: string) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const statistics = await getResultStatisticsService({
			examScheduleId,
			tenantId: session.user.tenantId,
		})

		return { success: true, data: statistics }
	} catch (error: any) {
		console.error('Error in getResultStatistics:', error)
		return {
			success: false,
			error: error.message || 'Failed to get result statistics',
		}
	}
}

// Delete Action
export async function deleteResultPublication(id: string) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		// Only allow deletion if results are not published
		const publication = await resultPublicationDB.findByExamScheduleId(
			id,
			session.user.tenantId,
		)

		if (publication?.isPublished) {
			throw new Error('Cannot delete published results')
		}

		await resultPublicationDB.deleteById(id, session.user.tenantId)

		// Revalidate paths
		revalidatePath('/admin/result-publication')

		return { success: true, message: 'Result publication deleted successfully' }
	} catch (error: any) {
		console.error('Error in deleteResultPublication:', error)
		return {
			success: false,
			error: error.message || 'Failed to delete result publication',
		}
	}
}

// Bulk Actions
export async function bulkPublishResults(examScheduleIds: string[]) {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const results = []
		for (const examScheduleId of examScheduleIds) {
			try {
				const result = await publishResultsService({
					data: {
						examScheduleId,
						notifyStudents: false,
						notifyParents: false,
						publishedBy: session.user.id,
					},
					tenantId: session.user.tenantId,
				})
				results.push({ examScheduleId, success: true, data: result })
			} catch (error: any) {
				results.push({
					examScheduleId,
					success: false,
					error: error.message,
				})
			}
		}

		// Revalidate paths
		revalidatePath('/admin/result-publication')

		return { success: true, data: results }
	} catch (error: any) {
		console.error('Error in bulkPublishResults:', error)
		return {
			success: false,
			error: error.message || 'Failed to bulk publish results',
		}
	}
}

export async function bulkUnpublishResults(examScheduleIds: string[]) {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const results = []
		for (const examScheduleId of examScheduleIds) {
			try {
				const result = await unpublishResultsService({
					examScheduleId,
					unpublishedBy: session.user.id,
					tenantId: session.user.tenantId,
				})
				results.push({ examScheduleId, success: true, data: result })
			} catch (error: any) {
				results.push({
					examScheduleId,
					success: false,
					error: error.message,
				})
			}
		}

		// Revalidate paths
		revalidatePath('/admin/result-publication')

		return { success: true, data: results }
	} catch (error: any) {
		console.error('Error in bulkUnpublishResults:', error)
		return {
			success: false,
			error: error.message || 'Failed to bulk unpublish results',
		}
	}
}