// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateTransactionCategoryPayload,
	UpdateTransactionCategoryInput,
} from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(
	data: CreateTransactionCategoryPayload,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.transactionCategory.create({ data })
}

async function update(id: string, data: UpdateTransactionCategoryInput) {
	return await prisma.transactionCategory.update({ where: { id }, data })
}

async function deleteTransactionCategory(id: string) {
	return await prisma.transactionCategory.delete({ where: { id } })
}

async function getAllTransactionCategories(tenantId: string) {
	return await prisma.transactionCategory.findMany({
		where: { tenantId },
	})
}

async function getTransactionCategoryById(id: string) {
	return await prisma.transactionCategory.findUnique({ where: { id } })
}

async function createManyTransactionCategory(
	data: CreateTransactionCategoryPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.transactionCategory.createMany({ data })
}

export const transactionCategoryDB = {
	create,
	update,
	delete: deleteTransactionCategory,
	createManyTransactionCategory,
	getAllTransactionCategories,
	getTransactionCategoryById,
}
