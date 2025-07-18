// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreatePaymentTransactionPayload,
	UpdatePaymentTransactionInput,
} from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(
	data: CreatePaymentTransactionPayload,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.paymentTransaction.create({ data })
}

async function update(id: string, data: UpdatePaymentTransactionInput) {
	return await prisma.paymentTransaction.update({ where: { id }, data })
}

async function deletePaymentTransaction(id: string) {
	return await prisma.paymentTransaction.delete({ where: { id } })
}

async function getAllPaymentTransactions(tenantId: string) {
	return await prisma.paymentTransaction.findMany({
		where: { tenantId },
	})
}

async function getPaymentTransactionById(id: string) {
	return await prisma.paymentTransaction.findUnique({ where: { id } })
}

async function createMany(data: CreatePaymentTransactionPayload[]) {
	return await prisma.paymentTransaction.createManyAndReturn({ data })
}

async function getPaymentTransactionByStudentId(studentId: string) {
	return await prisma.paymentTransaction.findMany({
		where: { studentId },
		include: { tenant: true, payments: { include: { dueItem: true } } },
	})
}

async function incrementPrintCount(id: string) {
	return await prisma.paymentTransaction.update({
		where: { id },
		data: { printCount: { increment: 1 } },
	})
}

export const paymentTransactionDB = {
	create,
	update,
	delete: deletePaymentTransaction,
	getAllPaymentTransactions,
	getPaymentTransactionById,
	createMany,
	getPaymentTransactionByStudentId,
	incrementPrintCount,
}
