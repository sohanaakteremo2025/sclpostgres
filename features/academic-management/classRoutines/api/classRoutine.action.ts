'use server'

import { CreateClassRoutinePayload, UpdateClassRoutineInput } from '@/lib/zod'
import {
	createClassRoutineService,
	getAllClassRoutinesService,
	getClassRoutineByIdService,
	updateClassRoutineService,
	deleteClassRoutineService,
} from '../services/classRoutine.service'

import { getTenantId } from '@/lib/tenant'

export async function createClassRoutine(data: CreateClassRoutinePayload) {
	const tenantId = await getTenantId()

	return await createClassRoutineService({ data: { ...data, tenantId } })
}

export async function getAllClassRoutines() {
	const tenantId = await getTenantId()

	return await getAllClassRoutinesService({
		tenantId,
	})
}

export async function getClassRoutineById(id: string) {
	return await getClassRoutineByIdService({
		id,
	})
}

export async function updateClassRoutine(
	id: string,
	data: UpdateClassRoutineInput,
) {
	return await updateClassRoutineService({
		id,
		data,
	})
}

export async function deleteClassRoutine(id: string) {
	return await deleteClassRoutineService({
		id,
	})
}
