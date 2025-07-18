// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateStudentEnrollmentPayload,
	UpdateStudentEnrollmentInput,
} from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(
	data: CreateStudentEnrollmentPayload,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.studentEnrollment.create({ data })
}

async function update(id: string, data: UpdateStudentEnrollmentInput) {
	return await prisma.studentEnrollment.update({ where: { id }, data })
}

async function deleteStudentEnrollment(id: string) {
	return await prisma.studentEnrollment.delete({ where: { id } })
}

async function getAllStudentEnrollments(tenantId: string) {
	return await prisma.studentEnrollment.findMany({
		where: { tenantId },
	})
}

async function getStudentEnrollmentById(id: string) {
	return await prisma.studentEnrollment.findUnique({ where: { id } })
}

async function createManyEnrollments(
	data: CreateStudentEnrollmentPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.studentEnrollment.createManyAndReturn({ data })
}

async function getStudentEnrollmentByStudentId(studentId: string) {
	return await prisma.studentEnrollment.findMany({
		where: { studentId },
	})
}

export const studentEnrollmentDB = {
	create,
	update,
	delete: deleteStudentEnrollment,
	createManyEnrollments,
	getAllStudentEnrollments,
	getStudentEnrollmentById,
	getStudentEnrollmentByStudentId,
}
