'use server'

import { getTenantId } from '@/lib/tenant'
import {
	getOrganizedExamSchedules,
	markExamComplete,
	startExam,
	cancelExam,
	getExamCompletionStats,
	updateExamStatus
} from '../services/exam-management.service'

export async function getOrganizedExamSchedulesAction() {
	try {
		const tenantId = await getTenantId()
		const result = await getOrganizedExamSchedules(tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in getOrganizedExamSchedulesAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

export async function markExamCompleteAction(examId: string) {
	try {
		const tenantId = await getTenantId()
		const result = await markExamComplete(examId, tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in markExamCompleteAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

export async function startExamAction(examId: string) {
	try {
		const tenantId = await getTenantId()
		const result = await startExam(examId, tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in startExamAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

export async function cancelExamAction(examId: string) {
	try {
		const tenantId = await getTenantId()
		const result = await cancelExam(examId, tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in cancelExamAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

export async function updateExamStatusAction(examId: string, status: string) {
	try {
		const tenantId = await getTenantId()
		const result = await updateExamStatus(examId, status, tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in updateExamStatusAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

export async function getExamCompletionStatsAction() {
	try {
		const tenantId = await getTenantId()
		const result = await getExamCompletionStats(tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in getExamCompletionStatsAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}