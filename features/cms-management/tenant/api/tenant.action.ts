'use server'

import { tenantService } from '../services/tenant.service'

export async function createTenant(data: any) {
	return await tenantService.create({
		data,
	})
}

export async function getAllTenants() {
	return await tenantService.getAll()
}

export async function updateTenant(id: string, data: any) {
	return await tenantService.update({
		id,
		data,
	})
}

export async function deleteTenant(id: string) {
	return await tenantService.delete({
		id,
	})
}
