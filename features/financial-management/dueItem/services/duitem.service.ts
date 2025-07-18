// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { dueItemDB } from '../db/duitem.repository'
import {
	CreateDueItemPayload,
	CreateFeeItemCategoryPayload,
	UpdateDueItemInput,
} from '@/lib/zod'

export async function createDueItemService({
	data,
}: {
	data: CreateDueItemPayload
}) {
	const result = await dueItemDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_DUES.TAG(data.tenantId),
	])

	return result
}

export async function getAllDueItemsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => dueItemDB.getAllDueItems(tenantId),
		{
			key: CACHE_KEYS.DUE_ITEMS.KEY(tenantId),
			tags: [CACHE_KEYS.DUE_ITEMS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getDueItemByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => dueItemDB.getDueItemById(id), {
		key: CACHE_KEYS.DUE_ITEM.KEY(id),
		tags: [CACHE_KEYS.DUE_ITEM.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateDueItemService({
	id,
	data,
}: {
	id: string
	data: UpdateDueItemInput
}) {
	const existing = await dueItemDB.getDueItemById(id)
	if (!existing) {
		throw new Error('Due Item not found')
	}

	const result = await dueItemDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.DUE_ITEMS.TAG(existing.tenantId),
		CACHE_KEYS.DUE_ITEMS.TAG(id),
	])

	return result
}

export async function deleteDueItemService({ id }: { id: string }) {
	const existing = await dueItemDB.getDueItemById(id)
	if (!existing) {
		throw new Error('Due Item not found')
	}

	await dueItemDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.DUE_ITEMS.TAG(existing.tenantId),
		CACHE_KEYS.DUE_ITEMS.TAG(id),
	])
}

// fee item category
export async function createFeeItemCategoryService({
	data,
}: {
	data: CreateFeeItemCategoryPayload
}) {
	const result = await dueItemDB.createFeeItemCategory(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_DUES.TAG(data.tenantId),
	])

	return result
}

export async function getAllFeeItemCategoriesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await dueItemDB.getAllFeeItemCategories(tenantId)
}
