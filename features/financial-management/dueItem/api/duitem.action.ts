'use server'

import {
	CreateDueItemPayload,
	CreateFeeItemCategoryInput,
	UpdateDueItemInput,
} from '@/lib/zod'
import {
	createDueItemService,
	getAllDueItemsService,
	getDueItemByIdService,
	updateDueItemService,
	deleteDueItemService,
	createFeeItemCategoryService,
	getAllFeeItemCategoriesService,
} from '../services/duitem.service'

import { getTenantId } from '@/lib/tenant'

export async function createDueItem(data: CreateDueItemPayload) {
	const tenantId = await getTenantId()

	return await createDueItemService({ data: { ...data, tenantId } })
}

export async function getAllDueItems() {
	const tenantId = await getTenantId()

	return await getAllDueItemsService({
		tenantId,
	})
}

export async function getDueItemById(id: string) {
	return await getDueItemByIdService({
		id,
	})
}

export async function updateDueItem(id: string, data: UpdateDueItemInput) {
	return await updateDueItemService({
		id,
		data,
	})
}

export async function deleteDueItem(id: string) {
	return await deleteDueItemService({
		id,
	})
}

// fee item category
export async function createFeeItemCategory(data: CreateFeeItemCategoryInput) {
	const tenantId = await getTenantId()

	return await createFeeItemCategoryService({ data: { ...data, tenantId } })
}

export async function getAllFeeItemCategories() {
	const tenantId = await getTenantId()

	return await getAllFeeItemCategoriesService({
		tenantId,
	})
}
