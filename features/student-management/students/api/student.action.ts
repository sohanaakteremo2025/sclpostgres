'use server'

import { createStudentService } from '../services/student.service'
import {
	CreateStudentInput,
	UpdateStudentInput,
	UpdateStudentInputSchema,
} from '@/lib/zod'
import {
	deleteStudentService,
	getStudentByIdService,
	getAllStudentService,
	updateStudentService,
	getStudentsBySectionIdService,
	getStudentsByClassIdService,
} from '../services/student.service'
import { getTenantId } from '@/lib/tenant'

export const createStudent = async (data: CreateStudentInput) => {
	const tenantId = await getTenantId()
	const admissionDate = data.admissionDate || new Date()
	return await createStudentService({ ...data, admissionDate, tenantId })
}

export const updateStudent = async (id: string, data: UpdateStudentInput) => {
	const parseZod = UpdateStudentInputSchema.parse(data)
	console.log(parseZod)
	return await updateStudentService(id, parseZod)
}

export const deleteStudent = async (id: string) => {
	return await deleteStudentService(id)
}

export const getStudentById = async (id: string) => {
	return await getStudentByIdService(id)
}

export const getAllStudent = async (tenantId: string) => {
	return await getAllStudentService(tenantId)
}

export const getStudentsBySectionId = async (sectionId: string) => {
	return await getStudentsBySectionIdService(sectionId)
}

export const getStudentsByClassId = async (classId: string) => {
	return await getStudentsByClassIdService(classId)
}
