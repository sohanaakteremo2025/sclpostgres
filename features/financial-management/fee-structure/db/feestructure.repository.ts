// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateFeeStructurePayload, UpdateFeeStructureInput } from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(data: CreateFeeStructurePayload, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.feeStructure.create({ data })
}

async function update(
	id: string,
	data: UpdateFeeStructureInput,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.feeStructure.update({ where: { id }, data })
}

async function deleteFeeStructure(id: string) {
	return await prisma.feeStructure.delete({ where: { id } })
}

async function getAllFeeStructures(tenantId: string) {
	return await prisma.feeStructure.findMany({
		where: { tenantId },
	})
}

async function getFeeStructureById(id: string) {
	return await prisma.feeStructure.findUnique({
		where: { id },
		include: { feeItems: true },
	})
}

export const feeStructureDB = {
	create,
	update,
	delete: deleteFeeStructure,
	getAllFeeStructures,
	getFeeStructureById,
}
