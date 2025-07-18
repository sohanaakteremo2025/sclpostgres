// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import {
	CreateTenantBillingSchedulePayload,
	UpdateTenantBillingScheduleInput,
} from '@/lib/zod'
import { billingScheduleDB } from '../db/billingSchedule.repository'

async function createBillingScheduleService({
	data,
}: {
	data: CreateTenantBillingSchedulePayload
}) {
	const result = await billingScheduleDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])

	return result
}

async function getAllBillingScheduleService() {
	return await nextjsCacheService.cached(
		() => billingScheduleDB.getAllBillingSchedules(),
		{
			key: CACHE_KEYS.TENANTS.BASE,
			tags: [CACHE_KEYS.TENANTS.TAG],
			revalidate: 300, // 5 minutes
		},
	)
}

async function updateBillingScheduleService({
	id,
	data,
}: {
	id: string
	data: UpdateTenantBillingScheduleInput
}) {
	const existing = await billingScheduleDB.getBillingScheduleById(id)
	if (!existing) {
		throw new Error('Billing not found')
	}

	const result = await billingScheduleDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])

	return result
}

async function deleteBillingScheduleService({ id }: { id: string }) {
	const existing = await billingScheduleDB.getBillingScheduleById(id)
	if (!existing) {
		throw new Error('Billing not found')
	}

	await billingScheduleDB.delete(id)

	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])
}

export const billingScheduleService = {
	create: createBillingScheduleService,
	getAll: getAllBillingScheduleService,
	update: updateBillingScheduleService,
	delete: deleteBillingScheduleService,
}
