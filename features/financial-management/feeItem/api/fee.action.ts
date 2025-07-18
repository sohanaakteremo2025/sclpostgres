'use server'

import { CreateFeeItemPayload, UpdateFeeItemInput } from '@/lib/zod'
import {
	createFeeItemService,
	getAllFeeItemsService,
	getFeeItemByIdService,
	updateFeeItemService,
	deleteFeeItemService,
	getAllFeeItemsByFeeStructureIdService,
} from '../services/fee.service'

import { getTenantId } from '@/lib/tenant'

export async function createFeeItem(data: CreateFeeItemPayload) {
	const tenantId = await getTenantId()

	return await createFeeItemService({ data: { ...data, tenantId } })
}

export async function getAllFeeItems() {
	const tenantId = await getTenantId()

	return await getAllFeeItemsService({
		tenantId,
	})
}

export async function getFeeItemById(id: string) {
	return await getFeeItemByIdService({
		id,
	})
}

export async function getAllFeeItemsByFeeStructureId(feeStructureId: string) {
	return await getAllFeeItemsByFeeStructureIdService({
		feeStructureId,
	})
}

export async function updateFeeItem(id: string, data: UpdateFeeItemInput) {
	return await updateFeeItemService({
		id,
		data,
	})
}

export async function deleteFeeItem(id: string) {
	return await deleteFeeItemService({
		id,
	})
}
