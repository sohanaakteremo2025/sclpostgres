//tenantDB
import { prisma } from '@/lib/db'
import { CreateTenantPayload, UpdateTenantInput } from '@/lib/zod'
import { TransactionClient } from '@/types'

async function create(data: CreateTenantPayload, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.tenant.create({ data })
}

async function update(
	id: string,
	data: UpdateTenantInput,
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenant.update({ where: { id }, data })
}

async function deleteTenant(id: string) {
	return await prisma.tenant.delete({ where: { id } })
}

async function getAllTenants() {
	return await prisma.tenant.findMany({
		orderBy: { name: 'asc' },
	})
}

async function getTenantById(id: string) {
	return await prisma.tenant.findUnique({ where: { id } })
}

export const tenantDB = {
	create,
	update,
	delete: deleteTenant,
	getAllTenants,
	getTenantById,
}
