// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateDueItemPayload,
	CreateStudentDuePayload,
	UpdateStudentDueInput,
} from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(data: CreateStudentDuePayload, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.studentDue.create({ data })
}

async function update(id: string, data: UpdateStudentDueInput) {
	return await prisma.studentDue.update({ where: { id }, data })
}

async function deleteStudentDue(id: string) {
	return await prisma.studentDue.delete({ where: { id } })
}

async function getAllStudentDues(tenantId: string) {
	return await prisma.studentDue.findMany({
		where: { tenantId },
	})
}

async function getStudentDueById(id: string) {
	return await prisma.studentDue.findUnique({ where: { id } })
}

async function createManyDue(
	data: CreateStudentDuePayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.studentDue.createManyAndReturn({ data })
}

async function getStudentDueByStudentId(studentId: string) {
	return await prisma.studentDue.findMany({
		where: { studentId },
		include: {
			dueItems: {
				include: {
					adjustments: true,
				},
			},
		},
	})
}

export const studentDueDB = {
	create,
	update,
	delete: deleteStudentDue,
	createManyDue,
	getAllStudentDues,
	getStudentDueById,
	getStudentDueByStudentId,
}
