'use server'

import { CreateClassInput, UpdateClassInput } from '@/lib/zod'
import {
	createClassService,
	getAllClassesService,
	getClassByIdService,
	updateClassService,
	deleteClassService,
} from '../services/class.service'

import { getTenantId } from '@/lib/tenant'

export async function createClass(data: CreateClassInput) {
	const tenantId = await getTenantId()
	const { name } = data

	return await createClassService({
		data: { name, tenantId },
	})
}

export async function getAllClasses() {
	const tenantId = await getTenantId()

	return await getAllClassesService({
		tenantId,
	})
}

export async function getClassById(id: string) {
	return await getClassByIdService({
		id,
	})
}

export async function updateClass(id: string, data: UpdateClassInput) {
	return await updateClassService({
		id,
		data,
	})
}

export async function deleteClass(id: string) {
	return await deleteClassService({
		id,
	})
}
