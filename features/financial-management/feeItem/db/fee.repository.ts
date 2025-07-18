// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateFeeItemPayload, UpdateFeeItemInput } from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(data: CreateFeeItemPayload, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.feeItem.create({ data })
}

async function createMany(
	data: CreateFeeItemPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.feeItem.createMany({ data })
}

async function update(
	id: string,
	data: UpdateFeeItemInput,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.feeItem.update({ where: { id }, data })
}

async function deleteFeeItem(id: string) {
	return await prisma.feeItem.delete({ where: { id } })
}

async function deleteManyFeeItems(ids: string[], tx?: TransactionClient) {
	const client = tx || prisma
	return await client.feeItem.deleteMany({ where: { id: { in: ids } } })
}

async function getAllFeeItems(feeStructureId: string) {
	return await prisma.feeItem.findMany({
		where: { feeStructureId },
	})
}

async function getFeeItemById(id: string) {
	return await prisma.feeItem.findUnique({ where: { id } })
}

async function getAllFeeItemsByFeeStructureId(feeStructureId: string) {
	return await prisma.feeItem.findMany({
		where: { feeStructureId },
	})
}

export const feeItemDB = {
	create,
	createMany,
	update,
	delete: deleteFeeItem,
	deleteMany: deleteManyFeeItems,
	getAllFeeItems,
	getAllFeeItemsByFeeStructureId,
	getFeeItemById,
}
