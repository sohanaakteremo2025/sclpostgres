'use server'

import {
	CreateExamScheduleInput,
	CreateExamSchedulePayload,
	UpdateExamScheduleInput,
} from '@/lib/zod'
import {
	createExamScheduleService,
	createBulkExamScheduleService,
	replaceBulkExamScheduleService,
	updateSubjectScheduleService,
	updateBulkExamScheduleService,
	deleteExamScheduleService,
} from '../services/examSchedule.service'

import { getTenantId } from '@/lib/tenant'
import { BulkExamScheduleFormData } from '../types'

export async function createExamSchedule(data: CreateExamScheduleInput) {
	const tenantId = await getTenantId()

	return await createExamScheduleService({ data, tenantId })
}

export async function createBulkExamSchedule(data: BulkExamScheduleFormData) {
	const tenantId = await getTenantId()

	return await createBulkExamScheduleService({ data, tenantId })
}

export async function updateBulkExamSchedule(data: BulkExamScheduleFormData) {
	const tenantId = await getTenantId()

	return await updateBulkExamScheduleService({ data, tenantId })
}

export async function updateSubjectSchedule(data: UpdateExamScheduleInput) {
	return await updateSubjectScheduleService({ data })
}

export async function deleteExamSchedule(id: string) {
	const tenantId = await getTenantId()
	const result = await deleteExamScheduleService({ id, tenantId })
	return result
}
