'use server'

import {
	CreateTransactionCategoryInput,
	UpdateTransactionCategoryInput,
} from '@/lib/zod'
import {
	createTransactionCategoryService,
	getAllTransactionCategoriesService,
	getTransactionCategoryByIdService,
	updateTransactionCategoryService,
	deleteTransactionCategoryService,
} from '../services/transactionCategory.service'

import { getTenantId } from '@/lib/tenant'

export async function createTransactionCategory(
	data: CreateTransactionCategoryInput,
) {
	const tenantId = await getTenantId()

	return await createTransactionCategoryService({ data: { ...data, tenantId } })
}

export async function getAllTransactionCategories() {
	const tenantId = await getTenantId()

	return await getAllTransactionCategoriesService({
		tenantId,
	})
}

export async function getTransactionCategoryById(id: string) {
	return await getTransactionCategoryByIdService({
		id,
	})
}

export async function updateTransactionCategory(
	id: string,
	data: UpdateTransactionCategoryInput,
) {
	return await updateTransactionCategoryService({
		id,
		data,
	})
}

export async function deleteTransactionCategory(id: string) {
	return await deleteTransactionCategoryService({
		id,
	})
}
