// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { feeItemDB } from '../db/fee.repository'
import { CreateFeeItemPayload, UpdateFeeItemInput } from '@/lib/zod'

export async function createFeeItemService({
	data,
}: {
	data: CreateFeeItemPayload
}) {
	const result = await feeItemDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.FEE_ITEM.TAG(data.tenantId)])

	return result
}

export async function getAllFeeItemsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => feeItemDB.getAllFeeItems(tenantId),
		{
			key: CACHE_KEYS.FEE_ITEMS.KEY(tenantId),
			tags: [CACHE_KEYS.FEE_ITEMS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getFeeItemByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => feeItemDB.getFeeItemById(id), {
		key: CACHE_KEYS.FEE_ITEM.KEY(id),
		tags: [CACHE_KEYS.FEE_ITEM.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function getAllFeeItemsByFeeStructureIdService({
	feeStructureId,
}: {
	feeStructureId: string
}) {
	return await nextjsCacheService.cached(
		() => feeItemDB.getAllFeeItemsByFeeStructureId(feeStructureId),
		{
			key: CACHE_KEYS.FEE_ITEMS.KEY(feeStructureId),
			tags: [CACHE_KEYS.FEE_ITEMS.TAG(feeStructureId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function updateFeeItemService({
	id,
	data,
}: {
	id: string
	data: UpdateFeeItemInput
}) {
	const existing = await feeItemDB.getFeeItemById(id)
	if (!existing) {
		throw new Error('Fee Item not found')
	}

	const result = await feeItemDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.FEE_ITEMS.TAG(existing.tenantId),
		CACHE_KEYS.FEE_ITEMS.TAG(id),
	])

	return result
}

export async function deleteFeeItemService({ id }: { id: string }) {
	const existing = await feeItemDB.getFeeItemById(id)
	if (!existing) {
		throw new Error('Fee Item not found')
	}

	await feeItemDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.FEE_ITEMS.TAG(existing.tenantId),
		CACHE_KEYS.FEE_ITEMS.TAG(id),
	])
}
