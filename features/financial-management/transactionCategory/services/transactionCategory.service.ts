// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { transactionCategoryDB } from '../db/transactionCategory.repository'
import {
	CreateTransactionCategoryPayload,
	UpdateTransactionCategoryInput,
} from '@/lib/zod'
import { queryClient } from '@/lib/query-client'

export async function createTransactionCategoryService({
	data,
}: {
	data: CreateTransactionCategoryPayload
}) {
	const result = await transactionCategoryDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TRANSACTION_CATEGORY.TAG(data.tenantId),
	])
	await queryClient.invalidateQueries({
		queryKey: ['tenant-transaction-categories'],
	})

	return result
}

export async function getAllTransactionCategoriesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await transactionCategoryDB.getAllTransactionCategories(tenantId)
}

export async function getTransactionCategoryByIdService({
	id,
}: {
	id: string
}) {
	return await nextjsCacheService.cached(
		() => transactionCategoryDB.getTransactionCategoryById(id),
		{
			key: CACHE_KEYS.TRANSACTION_CATEGORY.KEY(id),
			tags: [CACHE_KEYS.TRANSACTION_CATEGORY.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateTransactionCategoryService({
	id,
	data,
}: {
	id: string
	data: UpdateTransactionCategoryInput
}) {
	const existing = await transactionCategoryDB.getTransactionCategoryById(id)
	if (!existing) {
		throw new Error('Transaction Category not found')
	}

	const result = await transactionCategoryDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TRANSACTION_CATEGORIES.TAG(existing.tenantId),
		CACHE_KEYS.TRANSACTION_CATEGORY.TAG(id),
	])

	return result
}

export async function deleteTransactionCategoryService({ id }: { id: string }) {
	const existing = await transactionCategoryDB.getTransactionCategoryById(id)
	if (!existing) {
		throw new Error('Transaction Category not found')
	}

	await transactionCategoryDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.TRANSACTION_CATEGORIES.TAG(existing.tenantId),
		CACHE_KEYS.TRANSACTION_CATEGORY.TAG(id),
	])
}
