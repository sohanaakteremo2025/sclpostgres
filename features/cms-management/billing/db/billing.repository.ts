//tenantDB
import { prisma } from '@/lib/db'
import { CreateTenantBillingPayload, UpdateTenantBillingInput } from '@/lib/zod'

async function create(data: CreateTenantBillingPayload) {
	return await prisma.tenantBilling.create({ data })
}

async function update(id: string, data: UpdateTenantBillingInput) {
	return await prisma.tenantBilling.update({ where: { id }, data })
}

async function deleteBilling(id: string) {
	return await prisma.tenantBilling.delete({ where: { id } })
}

async function getAllBillings() {
	return await prisma.tenantBilling.findMany({
		orderBy: { createdAt: 'asc' },
	})
}

async function getBillingById(id: string) {
	return await prisma.tenantBilling.findUnique({ where: { id } })
}

export const billingDB = {
	create,
	update,
	delete: deleteBilling,
	getAllBillings,
	getBillingById,
}
