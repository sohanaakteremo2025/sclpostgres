'use server'

import {
	CreateTenantEmployeePayload,
	EmployeeRole,
	UpdateTenantEmployeeInput,
} from '@/lib/zod'
import {
	createEmployeeService,
	getAllEmployeesService,
	getEmployeeByIdService,
	updateEmployeeService,
	deleteEmployeeService,
	getEmployeeByRoleService,
} from '../services/employee.service'

import { getTenantId } from '@/lib/tenant'

export async function createEmployee(data: CreateTenantEmployeePayload) {
	const tenantId = await getTenantId()
	return await createEmployeeService({
		data: { ...data, tenantId },
	})
}

export async function getAllEmployees() {
	const tenantId = await getTenantId()

	return await getAllEmployeesService({
		tenantId,
	})
}

export async function getEmployeeById(id: string) {
	return await getEmployeeByIdService({
		id,
	})
}

export async function updateEmployee(
	id: string,
	data: UpdateTenantEmployeeInput,
) {
	return await updateEmployeeService({
		id,
		data,
	})
}

export async function deleteEmployee(id: string) {
	return await deleteEmployeeService({
		id,
	})
}

export async function getEmployeeByRole(role: EmployeeRole) {
	const tenantId = await getTenantId()
	return await getEmployeeByRoleService({
		role,
		tenantId,
	})
}
;``
