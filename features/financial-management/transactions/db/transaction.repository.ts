// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateTenantTransactionPayload,
	UpdateTenantTransactionInput,
} from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(
	data: CreateTenantTransactionPayload,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenantTransaction.create({ data })
}

async function update(id: string, data: UpdateTenantTransactionInput) {
	return await prisma.tenantTransaction.update({ where: { id }, data })
}

async function deleteTransaction(id: string) {
	return await prisma.tenantTransaction.delete({ where: { id } })
}

async function getAllTransactions(tenantId: string) {
	return await prisma.tenantTransaction.findMany({
		where: { tenantId },
	})
}

async function getTransactionById(id: string) {
	return await prisma.tenantTransaction.findUnique({ where: { id } })
}

async function deleteMany(ids: string[]) {
	return await prisma.tenantTransaction.deleteMany({
		where: { id: { in: ids } },
	})
}

async function createMany(
	data: CreateTenantTransactionPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenantTransaction.createManyAndReturn({ data })
}

export const transactionDB = {
	create,
	update,
	delete: deleteTransaction,
	getAllTransactions,
	getTransactionById,
	deleteMany,
	createMany,
}
