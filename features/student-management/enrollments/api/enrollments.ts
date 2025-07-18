'use server'

import {
	CreateStudentEnrollmentInput,
	UpdateStudentEnrollmentInput,
} from '@/lib/zod'
import {
	createStudentEnrollmentService,
	getAllStudentEnrollmentsService,
	getStudentEnrollmentByIdService,
	updateStudentEnrollmentService,
	deleteStudentEnrollmentService,
	getStudentEnrollmentByStudentIdService,
} from '../services/enrollment.service'

import { getTenantId } from '@/lib/tenant'

export async function createStudentEnrollment(
	data: CreateStudentEnrollmentInput,
) {
	const tenantId = await getTenantId()

	return await createStudentEnrollmentService({ data: { ...data, tenantId } })
}

export async function getAllStudentEnrollments() {
	const tenantId = await getTenantId()

	return await getAllStudentEnrollmentsService({
		tenantId,
	})
}

export async function getStudentEnrollmentById(id: string) {
	return await getStudentEnrollmentByIdService({
		id,
	})
}

export async function getStudentEnrollmentByStudentId(studentId: string) {
	return await getStudentEnrollmentByStudentIdService({
		studentId,
	})
}

export async function updateStudentEnrollment(
	id: string,
	data: UpdateStudentEnrollmentInput,
) {
	return await updateStudentEnrollmentService({
		id,
		data,
	})
}

export async function deleteStudentEnrollment(id: string) {
	return await deleteStudentEnrollmentService({
		id,
	})
}
