// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateTenantEmployeePayload,
	EmployeeRole,
	UpdateTenantEmployeeInput,
	UserRole,
} from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateTenantEmployeePayload) {
	return await prisma.tenantEmployee.create({ data })
}

async function update(id: string, data: UpdateTenantEmployeeInput) {
	return await prisma.tenantEmployee.update({ where: { id }, data })
}

async function deleteEmployee(id: string) {
	return await prisma.tenantEmployee.delete({ where: { id } })
}

async function findByName(name: string, tenantId: string) {
	return await prisma.tenantEmployee.findFirst({
		where: { name, tenantId },
	})
}

async function getAllEmployees(tenantId: string) {
	return await prisma.tenantEmployee.findMany({
		where: { tenantId },
		orderBy: { name: 'asc' },
	})
}

async function getEmployeeById(id: string) {
	return await prisma.tenantEmployee.findUnique({ where: { id } })
}

async function getEmployeeByRole(role: EmployeeRole, tenantId: string) {
	return await prisma.tenantEmployee.findMany({
		where: { role, tenantId },
	})
}

export const employeeDB = {
	create,
	update,
	delete: deleteEmployee,
	getAllEmployees,
	getEmployeeById,
	findByName,
	getEmployeeByRole,
}
