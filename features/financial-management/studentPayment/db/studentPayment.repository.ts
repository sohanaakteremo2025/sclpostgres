// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateStudentPaymentPayload,
	UpdateStudentPaymentInput,
} from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(data: CreateStudentPaymentPayload) {
	return await prisma.studentPayment.create({ data })
}

async function update(id: string, data: UpdateStudentPaymentInput) {
	return await prisma.studentPayment.update({ where: { id }, data })
}

async function deleteStudentPayment(id: string) {
	return await prisma.studentPayment.delete({ where: { id } })
}

async function getAllStudentPayments(tenantId: string) {
	return await prisma.studentPayment.findMany({
		where: { tenantId },
	})
}

async function getStudentPaymentById(id: string) {
	return await prisma.studentPayment.findUnique({ where: { id } })
}

async function createMany(
	data: CreateStudentPaymentPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.studentPayment.createManyAndReturn({ data })
}

export const studentPaymentDB = {
	create,
	update,
	delete: deleteStudentPayment,
	getAllStudentPayments,
	getStudentPaymentById,
	createMany,
}
