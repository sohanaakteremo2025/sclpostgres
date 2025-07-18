'use server'

import {
	CreateExamTypeInput,
	CreateExamTypePayload,
	UpdateExamTypeInput,
} from '@/lib/zod'
import {
	createExamTypeService,
	getAllExamTypesService,
	getExamTypeByIdService,
	updateExamTypeService,
	deleteExamTypeService,
} from '../services/exam-types.service'

import { getTenantId } from '@/lib/tenant'

export async function createExamType(data: CreateExamTypeInput) {
	const tenantId = await getTenantId()

	return await createExamTypeService({ data: { ...data, tenantId } })
}

export async function getAllExamTypes() {
	const tenantId = await getTenantId()

	return await getAllExamTypesService({
		tenantId,
	})
}

export async function getExamTypeById(id: string) {
	return await getExamTypeByIdService({
		id,
	})
}

export async function updateExamType(id: string, data: UpdateExamTypeInput) {
	return await updateExamTypeService({
		id,
		data,
	})
}

export async function deleteExamType(id: string) {
	return await deleteExamTypeService({
		id,
	})
}
