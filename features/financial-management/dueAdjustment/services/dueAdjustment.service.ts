// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { dueAdjustmentDB } from '../db/dueAdjustment.repository'
import {
	CreateDiscountCategoryInput,
	CreateDiscountCategoryPayload,
	CreateDueAdjustmentPayload,
	UpdateDiscountCategoryInput,
	UpdateDueAdjustmentInput,
} from '@/lib/zod'
import { dueItemDB } from '../../dueItem/db/duitem.repository'

export async function createDueAdjustmentService({
	data,
}: {
	data: CreateDueAdjustmentPayload
}) {
	console.log('Due Adjustment Data', data)
	// increment/decrement based on adjustment type
	//helper function to isDiscount
	const isDiscount = data.type === 'DISCOUNT' || data.type === 'WAIVER'
	// if isDiscount is true then decrement else increment the due amount
	const dueItem = await dueItemDB.getDueItemById(data.dueItemId)
	if (!dueItem) {
		throw new Error('Due Item not found')
	}
	if (isDiscount) {
		await dueItemDB.decrementDueItemAmount(dueItem.id, data.amount)
	} else {
		await dueItemDB.incrementDueItemAmount(dueItem.id, data.amount)
	}
	const result = await dueAdjustmentDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.DUE_ADJUSTMENTS.TAG(data.tenantId),
		CACHE_KEYS.STUDENT_DUES.TAG(data.tenantId),
		CACHE_KEYS.STUDENTS.TAG(data.tenantId),
	])

	return result
}

export async function getAllDueAdjustmentsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => dueAdjustmentDB.getAllDueAdjustments(tenantId),
		{
			key: CACHE_KEYS.DUE_ADJUSTMENTS.KEY(tenantId),
			tags: [CACHE_KEYS.DUE_ADJUSTMENTS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getDueAdjustmentByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => dueAdjustmentDB.getDueAdjustmentById(id),
		{
			key: CACHE_KEYS.DUE_ADJUSTMENT.KEY(id),
			tags: [CACHE_KEYS.DUE_ADJUSTMENT.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateDueAdjustmentService({
	id,
	data,
}: {
	id: string
	data: UpdateDueAdjustmentInput
}) {
	const existing = await dueAdjustmentDB.getDueAdjustmentById(id)
	if (!existing) {
		throw new Error('Due Adjustment not found')
	}

	const result = await dueAdjustmentDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.DUE_ADJUSTMENTS.TAG(existing.tenantId),
		CACHE_KEYS.DUE_ADJUSTMENT.TAG(id),
	])

	return result
}

export async function deleteDueAdjustmentService({ id }: { id: string }) {
	const existing = await dueAdjustmentDB.getDueAdjustmentById(id)
	if (!existing) {
		throw new Error('Due Adjustment not found')
	}

	await dueAdjustmentDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.DUE_ADJUSTMENTS.TAG(existing.tenantId),
		CACHE_KEYS.DUE_ADJUSTMENT.TAG(id),
	])
}

// discount services
export async function createDiscountCategoryService({
	data,
}: {
	data: CreateDiscountCategoryPayload
}) {
	return await dueAdjustmentDB.createDiscountCategory(data)
}

export async function updateDiscountCategoryService({
	id,
	data,
}: {
	id: string
	data: UpdateDiscountCategoryInput
}) {
	return await dueAdjustmentDB.updateDiscountCategory(id, data)
}

export async function deleteDiscountCategoryService({ id }: { id: string }) {
	return await dueAdjustmentDB.deleteDiscountCategory(id)
}

export async function getAllDiscountCategoriesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await dueAdjustmentDB.getAllDiscountCategories(tenantId)
}
