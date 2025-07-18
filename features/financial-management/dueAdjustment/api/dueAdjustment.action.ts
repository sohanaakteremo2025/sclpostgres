'use server'

import {
	CreateDiscountCategoryInput,
	CreateDueAdjustmentInput,
	CreateDueAdjustmentPayload,
	UpdateDiscountCategoryInput,
	UpdateDueAdjustmentInput,
} from '@/lib/zod'
import {
	createDueAdjustmentService,
	getAllDueAdjustmentsService,
	getDueAdjustmentByIdService,
	updateDueAdjustmentService,
	deleteDueAdjustmentService,
	getAllDiscountCategoriesService,
	createDiscountCategoryService,
	updateDiscountCategoryService,
	deleteDiscountCategoryService,
} from '../services/dueAdjustment.service'

import { getTenantId } from '@/lib/tenant'
import { auth } from '@/auth'

export async function createDueAdjustment(data: CreateDueAdjustmentInput) {
	const tenantId = await getTenantId()
	const session = await auth()

	return await createDueAdjustmentService({
		data: { ...data, tenantId, appliedBy: session?.user?.name || '' },
	})
}

export async function getAllDiscountCategories() {
	const tenantId = await getTenantId()
	return await getAllDiscountCategoriesService({
		tenantId,
	})
}

export async function createDiscountCategory(
	data: CreateDiscountCategoryInput,
) {
	const tenantId = await getTenantId()

	return await createDiscountCategoryService({
		data: { ...data, tenantId },
	})
}

export async function updateDiscountCategory(
	id: string,
	data: UpdateDiscountCategoryInput,
) {
	return await updateDiscountCategoryService({
		id,
		data,
	})
}

export async function deleteDiscountCategory(id: string) {
	return await deleteDiscountCategoryService({
		id,
	})
}

export async function getAllDueAdjustments() {
	const tenantId = await getTenantId()

	return await getAllDueAdjustmentsService({
		tenantId,
	})
}

export async function getDueAdjustmentById(id: string) {
	return await getDueAdjustmentByIdService({
		id,
	})
}

export async function updateDueAdjustment(
	id: string,
	data: UpdateDueAdjustmentInput,
) {
	return await updateDueAdjustmentService({
		id,
		data,
	})
}

export async function deleteDueAdjustment(id: string) {
	return await deleteDueAdjustmentService({
		id,
	})
}
