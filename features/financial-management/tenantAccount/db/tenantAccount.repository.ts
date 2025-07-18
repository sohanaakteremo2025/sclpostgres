// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateTenantAccountPayload, UpdateTenantAccountInput } from '@/lib/zod'
import { TransactionClient } from '@/types'
import Decimal from 'decimal.js'

// Pure data access - no caching!
async function create(
	data: CreateTenantAccountPayload,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenantAccount.create({ data })
}

async function update(id: string, data: UpdateTenantAccountInput) {
	return await prisma.tenantAccount.update({ where: { id }, data })
}

async function deleteTenantAccount(id: string) {
	return await prisma.tenantAccount.delete({ where: { id } })
}

async function getAllTenantAccounts(tenantId: string) {
	return await prisma.tenantAccount.findMany({
		where: { tenantId },
	})
}

async function getTenantAccountById(id: string) {
	return await prisma.tenantAccount.findUnique({ where: { id } })
}

async function createManyTenantAccount(
	data: CreateTenantAccountPayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenantAccount.createMany({ data })
}

async function incrementBalance(
	id: string,
	amount: Decimal,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenantAccount.update({
		where: { id },
		data: { balance: { increment: amount } },
	})
}

async function decrementBalance(
	id: string,
	amount: Decimal,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenantAccount.update({
		where: { id },
		data: { balance: { decrement: amount } },
	})
}

async function getTenantAccountsByIds(ids: string[], tx?: TransactionClient) {
	const client = tx || prisma
	return await client.tenantAccount.findMany({ where: { id: { in: ids } } })
}

export const tenantAccountDB = {
	create,
	update,
	delete: deleteTenantAccount,
	createManyTenantAccount,
	getAllTenantAccounts,
	getTenantAccountById,
	incrementBalance,
	decrementBalance,
	getTenantAccountsByIds,
}
