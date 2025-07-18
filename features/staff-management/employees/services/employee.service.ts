// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { employeeDB } from '../db/employee.repository'
import {
	CreateTenantEmployeePayload,
	EmployeeRole,
	UpdateTenantEmployeeInput,
} from '@/lib/zod'

export async function createEmployeeService({
	data,
}: {
	data: CreateTenantEmployeePayload
}) {
	const result = await employeeDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.EMPLOYEES.TAG(data.tenantId)])

	return result
}

export async function getAllEmployeesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => employeeDB.getAllEmployees(tenantId),
		{
			key: CACHE_KEYS.EMPLOYEES.KEY(tenantId),
			tags: [CACHE_KEYS.EMPLOYEES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getEmployeeByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => employeeDB.getEmployeeById(id), {
		key: CACHE_KEYS.EMPLOYEES.KEY(id),
		tags: [CACHE_KEYS.EMPLOYEES.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateEmployeeService({
	id,
	data,
}: {
	id: string
	data: UpdateTenantEmployeeInput
}) {
	const existing = await employeeDB.getEmployeeById(id)
	if (!existing) {
		throw new Error('Employee not found')
	}

	const result = await employeeDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.EMPLOYEES.TAG(existing.tenantId),
		CACHE_KEYS.EMPLOYEE.TAG(id),
	])

	return result
}

export async function deleteEmployeeService({ id }: { id: string }) {
	const existing = await employeeDB.getEmployeeById(id)
	if (!existing) {
		throw new Error('Employee not found')
	}

	await employeeDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.EMPLOYEES.TAG(existing.tenantId),
		CACHE_KEYS.EMPLOYEE.TAG(id),
	])
}

export async function getEmployeeByRoleService({
	role,
	tenantId,
}: {
	role: EmployeeRole
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => employeeDB.getEmployeeByRole(role, tenantId),
		{
			key: CACHE_KEYS.EMPLOYEES.KEY(tenantId),
			tags: [CACHE_KEYS.EMPLOYEES.TAG(tenantId)],
			revalidate: 600, // 10 minutes
		},
	)
}
