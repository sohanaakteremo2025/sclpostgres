// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateDueAdjustmentPayload, UpdateDueAdjustmentInput } from '@/lib/zod'
import { TransactionClient } from '@/types'

// Pure data access - no caching!
async function create(
	data: CreateDueAdjustmentPayload,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.dueAdjustment.create({ data })
}

async function update(id: string, data: UpdateDueAdjustmentInput) {
	return await prisma.dueAdjustment.update({ where: { id }, data })
}

async function deleteDueAdjustment(id: string) {
	return await prisma.dueAdjustment.delete({ where: { id } })
}

async function getAllDueAdjustments(tenantId: string) {
	return await prisma.dueAdjustment.findMany({
		where: { tenantId },
	})
}

async function getDueAdjustmentById(id: string) {
	return await prisma.dueAdjustment.findUnique({ where: { id } })
}

async function createManyDueAdjustment(data: any, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.dueAdjustment.createManyAndReturn({ data })
}

async function createDiscountCategory(data: any, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.discountCategory.create({ data })
}

async function updateDiscountCategory(id: string, data: any) {
	return await prisma.discountCategory.update({ where: { id }, data })
}

async function deleteDiscountCategory(id: string) {
	return await prisma.discountCategory.delete({ where: { id } })
}

async function getAllDiscountCategories(tenantId: string) {
	return await prisma.discountCategory.findMany({
		where: { tenantId },
	})
}

export const dueAdjustmentDB = {
	create,
	update,
	delete: deleteDueAdjustment,
	createManyDueAdjustment,
	getAllDueAdjustments,
	getDueAdjustmentById,
	createDiscountCategory,
	updateDiscountCategory,
	deleteDiscountCategory,
	getAllDiscountCategories,
}
