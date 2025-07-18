// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CreateTenantBillingPayload, UpdateTenantBillingInput } from '@/lib/zod'
import { billingDB } from '../db/billing.repository'

async function createBillingService({
	data,
}: {
	data: CreateTenantBillingPayload
}) {
	const result = await billingDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])

	return result
}

async function getAllBillingsService() {
	return await nextjsCacheService.cached(() => billingDB.getAllBillings(), {
		key: CACHE_KEYS.TENANTS.BASE,
		tags: [CACHE_KEYS.TENANTS.TAG],
		revalidate: 300, // 5 minutes
	})
}

async function updateBillingService({
	id,
	data,
}: {
	id: string
	data: UpdateTenantBillingInput
}) {
	const existing = await billingDB.getBillingById(id)
	if (!existing) {
		throw new Error('Billing not found')
	}

	const result = await billingDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])

	return result
}

async function deleteBillingService({ id }: { id: string }) {
	const existing = await billingDB.getBillingById(id)
	if (!existing) {
		throw new Error('Billing not found')
	}

	await billingDB.delete(id)

	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])
}

export const billingService = {
	create: createBillingService,
	getAll: getAllBillingsService,
	update: updateBillingService,
	delete: deleteBillingService,
}
