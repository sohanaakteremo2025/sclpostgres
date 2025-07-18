'use server'

import { CreateTenantBillingPayload, UpdateTenantBillingInput } from '@/lib/zod'
import { billingService } from '../services/billing.service'

export async function createBilling(data: CreateTenantBillingPayload) {
	return await billingService.create({
		data,
	})
}

export async function getAllBillings() {
	return await billingService.getAll()
}

export async function updateBilling(
	id: string,
	data: UpdateTenantBillingInput,
) {
	return await billingService.update({
		id,
		data,
	})
}

export async function deleteBilling(id: string) {
	return await billingService.delete({
		id,
	})
}
