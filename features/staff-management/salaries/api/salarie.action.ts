'use server'

import {
	CreateTenantSalaryItemPayload,
	UpdateTenantSalaryItemInput,
} from '@/lib/zod'
import {
	createSalaryService,
	getAllSalariesService,
	getSalaryByIdService,
	updateSalaryService,
	deleteSalaryService,
} from '../services/salarie.service'

import { getTenantId } from '@/lib/tenant'

export async function createSalary(data: CreateTenantSalaryItemPayload) {
	const tenantId = await getTenantId()
	return await createSalaryService({
		data: { ...data, salaryStructureId: tenantId },
	})
}

export async function getAllSalaries() {
	const tenantId = await getTenantId()

	return await getAllSalariesService({
		tenantId,
	})
}

export async function getSalaryById(id: string) {
	return await getSalaryByIdService({
		id,
	})
}

export async function updateSalary(
	id: string,
	data: UpdateTenantSalaryItemInput,
) {
	return await updateSalaryService({
		id,
		data,
	})
}

export async function deleteSalary(id: string) {
	return await deleteSalaryService({
		id,
	})
}
