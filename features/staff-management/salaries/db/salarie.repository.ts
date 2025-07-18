// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateTenantSalaryItemPayload,
	UpdateTenantSalaryItemInput,
} from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateTenantSalaryItemPayload) {
	return await prisma.tenantSalaryItem.create({ data })
}

async function update(id: string, data: UpdateTenantSalaryItemInput) {
	return await prisma.tenantSalaryItem.update({ where: { id }, data })
}

async function deleteSalary(id: string) {
	return await prisma.tenantSalaryItem.delete({ where: { id } })
}

async function findByName(title: string, tenantId: string) {
	return await prisma.tenantSalaryItem.findFirst({
		where: { title, salaryStructureId: tenantId },
	})
}

async function getAllSalaries(tenantId: string) {
	return await prisma.tenantSalaryItem.findMany({
		where: { salaryStructureId: tenantId },
		orderBy: { title: 'asc' },
	})
}

async function getSalaryById(id: string) {
	return await prisma.tenantSalaryItem.findUnique({ where: { id } })
}

export const salaryDB = {
	create,
	update,
	delete: deleteSalary,
	getAllSalaries,
	getSalaryById,
	findByName,
}
