'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { getTenantId } from '../../../../lib/tenant'
import { ResultPublicationRepository } from '../db/resultPublication.repository'
import {
	enterBulkResultsService,
	getExamResultsService,
	getResultStatisticsService,
	publishResultsService,
	unpublishResultsService,
	updateComponentResultService,
} from '../services/result.service'

// Result Publication Actions
export async function publishExamResults(
	examScheduleId: string,
	notifyStudents: boolean = false,
	notifyParents: boolean = false,
) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			throw new Error('Unauthorized')
		}

		const result = await publishResultsService({
			examScheduleId,
			publishedBy: session.user.id,
			tenantId: session.user.tenantId!,
			notifyStudents,
			notifyParents,
		})

		revalidatePath('/admin/exam')
		revalidatePath('/admin/exam-schedules')
		return { success: true, data: result }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

export async function unpublishExamResults(examScheduleId: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			throw new Error('Unauthorized')
		}

		const result = await unpublishResultsService(
			examScheduleId,
			session.user.id,
		)

		revalidatePath('/admin/exam')
		revalidatePath('/admin/exam-schedules')
		return { success: true, data: result }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

// Result Entry Actions
export async function enterBulkResults(data: {
	examScheduleId: string
	results: {
		studentId: string
		componentResults: {
			examComponentId: string
			obtainedMarks: number
			isAbsent?: boolean
			remarks?: string
		}[]
	}[]
}) {
	try {
		const session = await auth()
		const tenantId = await getTenantId()
		if (!session?.user?.id) {
			throw new Error('Unauthorized')
		}

		const result = await enterBulkResultsService({
			...data,
			enteredBy: session.user.id,
			tenantId: tenantId,
		})

		revalidatePath('/admin/exam')
		revalidatePath('/admin/exam-schedules')
		return { success: true, data: result }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

export async function updateComponentResult(
	componentResultId: string,
	newMarks: number,
	remarks?: string,
) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			throw new Error('Unauthorized')
		}

		const result = await updateComponentResultService(
			componentResultId,
			newMarks,
			session.user.id,
			remarks,
		)

		revalidatePath('/admin/exam')
		revalidatePath('/admin/exam-schedules')
		return { success: true, data: result }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

// Result Query Actions
export async function getExamResults(
	examScheduleId: string,
	includeUnpublished: boolean = false,
) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const results = await getExamResultsService(
			examScheduleId,
			includeUnpublished,
		)

		return { success: true, data: results }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

export async function getResultStatistics(examScheduleId: string) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const statistics = await getResultStatisticsService(examScheduleId)
		return { success: true, data: statistics }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

export async function getResultPublications(filters?: {
	examId?: string
	classId?: string
	sectionId?: string
	sessionId?: string
	isPublished?: boolean
}) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const repository = new ResultPublicationRepository(session.user.tenantId)
		const publications = await repository.findMany(filters)

		return { success: true, data: publications }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

export async function getResultPublication(examScheduleId: string) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const repository = new ResultPublicationRepository(session.user.tenantId)
		const publication = await repository.findByExamSchedule(examScheduleId)

		return { success: true, data: publication }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

// Student/Parent facing actions
export async function getStudentResults(studentId: string, sessionId?: string) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		// Additional authorization check for student/parent roles
		if (session.user.role === 'STUDENT' && session.user.id !== studentId) {
			throw new Error('Unauthorized to view other student results')
		}

		const results = await getExamResultsService(studentId, false) // Only published results
		return { success: true, data: results }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}

export async function getClassResults(
	classId: string,
	sectionId: string,
	sessionId: string,
) {
	try {
		const session = await auth()
		if (!session?.user?.tenantId) {
			throw new Error('Unauthorized')
		}

		const repository = new ResultPublicationRepository(session.user.tenantId)
		const results = await repository.getClassResults(
			classId,
			sectionId,
			sessionId,
		)

		return { success: true, data: results }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
}
