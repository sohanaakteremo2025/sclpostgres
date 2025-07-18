// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateFeeItemCategoryPayload, CreateDueItemPayload } from '@/lib/zod'
import { TransactionClient } from '@/types'
import Decimal from 'decimal.js'

// Pure data access - no caching!
async function create(data: CreateDueItemPayload, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.dueItem.create({ data })
}

async function update(id: string, data: any, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.dueItem.update({ where: { id }, data })
}

async function deleteDueItem(id: string) {
	return await prisma.dueItem.delete({ where: { id } })
}

async function getAllDueItems(tenantId: string) {
	return await prisma.dueItem.findMany({
		where: { tenantId },
	})
}

async function getDueItemById(id: string) {
	return await prisma.dueItem.findUnique({ where: { id } })
}

async function createManyDueItem(
	data: CreateDueItemPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.dueItem.createManyAndReturn({ data })
}

async function incrementDueItemAmount(id: string, amount: Decimal) {
	return await prisma.dueItem.update({
		where: { id },
		data: { finalAmount: { increment: amount } },
	})
}

async function decrementDueItemAmount(id: string, amount: Decimal) {
	return await prisma.dueItem.update({
		where: { id },
		data: { finalAmount: { decrement: amount } },
	})
}

async function getDueItemsByIds(ids: string[], tx?: TransactionClient) {
	const client = tx || prisma
	return await client.dueItem.findMany({ where: { id: { in: ids } } })
}

// fee item category
async function createFeeItemCategory(
	data: CreateFeeItemCategoryPayload,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.feeItemCategory.create({ data })
}

async function updateFeeItemCategory(
	id: string,
	data: any,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.feeItemCategory.update({ where: { id }, data })
}

async function deleteFeeItemCategory(id: string) {
	return await prisma.feeItemCategory.delete({ where: { id } })
}

async function getAllFeeItemCategories(tenantId: string) {
	return await prisma.feeItemCategory.findMany({
		where: { tenantId },
	})
}

async function getFeeItemCategoryById(id: string) {
	return await prisma.feeItemCategory.findUnique({ where: { id } })
}

async function createManyFeeItemCategory(
	data: CreateFeeItemCategoryPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.feeItemCategory.createManyAndReturn({ data })
}

export const dueItemDB = {
	create,
	update,
	delete: deleteDueItem,
	createManyDueItem,
	getAllDueItems,
	getDueItemById,
	incrementDueItemAmount,
	decrementDueItemAmount,
	getDueItemsByIds,
	createFeeItemCategory,
	updateFeeItemCategory,
	deleteFeeItemCategory,
	getAllFeeItemCategories,
	getFeeItemCategoryById,
	createManyFeeItemCategory,
}
