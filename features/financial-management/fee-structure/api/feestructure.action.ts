'use server'

import { CreateFeeStructureInput, UpdateFeeStructureInput } from '@/lib/zod'
import {
	createFeeStructureService,
	getAllFeeStructuresService,
	getFeeStructureByIdService,
	updateFeeStructureService,
	deleteFeeStructureService,
} from '../services/feestructure.service'

import { getTenantId } from '@/lib/tenant'

export async function createFeeStructure(data: any) {
	const tenantId = await getTenantId()

	return await createFeeStructureService({ data: { ...data, tenantId } })
}

export async function getAllFeeStructures() {
	const tenantId = await getTenantId()

	return await getAllFeeStructuresService({
		tenantId,
	})
}

export async function getFeeStructureById(id: string) {
	return await getFeeStructureByIdService({
		id,
	})
}

export async function updateFeeStructure(id: string, data: any) {
	return await updateFeeStructureService({
		id,
		data,
	})
}

export async function deleteFeeStructure(id: string) {
	return await deleteFeeStructureService({
		id,
	})
}
