'use server'

import { CreateExamInput, UpdateExamInput } from '@/lib/zod'
import {
	createExamService,
	getAllExamsService,
	getExamByIdService,
	updateExamService,
	deleteExamService,
} from '../services/exam.service'

import { getTenantId } from '@/lib/tenant'

export async function createExam(data: CreateExamInput) {
	const tenantId = await getTenantId()

	return await createExamService({ data: { ...data, tenantId } })
}

export async function getAllExams() {
	const tenantId = await getTenantId()

	return await getAllExamsService({
		tenantId,
	})
}

export async function getExamById(id: string) {
	return await getExamByIdService({
		id,
	})
}

export async function updateExam(id: string, data: UpdateExamInput) {
	return await updateExamService({
		id,
		data,
	})
}

export async function deleteExam(id: string) {
	return await deleteExamService({
		id,
	})
}
