// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CreateFeeStructurePayload, UpdateFeeStructureInput } from '@/lib/zod'
import { feeStructureDB } from '../db/feestructure.repository'
import { feeItemDB } from '../../feeItem/db/fee.repository'
import { prisma } from '@/lib/db'

export async function createFeeStructureService({ data }: { data: any }) {
	const { feeItems, ...restData } = data
	const result = await prisma.$transaction(async tx => {
		const feeStructure = await feeStructureDB.create(restData, tx)
		const feeItemsData = feeItems.map((item: any) => ({
			...item,
			feeStructureId: feeStructure.id,
		}))
		await feeItemDB.createMany(feeItemsData, tx)
		return true
	})

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.FEE_STRUCTURES.TAG(data.tenantId),
	])

	return result
}

export async function getAllFeeStructuresService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => feeStructureDB.getAllFeeStructures(tenantId),
		{
			key: CACHE_KEYS.FEE_STRUCTURES.KEY(tenantId),
			tags: [CACHE_KEYS.FEE_STRUCTURES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getFeeStructureByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => feeStructureDB.getFeeStructureById(id),
		{
			key: CACHE_KEYS.FEE_STRUCTURE_BY_ID.KEY(id),
			tags: [CACHE_KEYS.FEE_STRUCTURE_BY_ID.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateFeeStructureService({
	id,
	data,
}: {
	id: string
	data: any
}) {
	const existing = await feeStructureDB.getFeeStructureById(id)
	if (!existing) {
		throw new Error('Fee Structure not found')
	}

	const { feeItems, ...restData } = data

	const result = await prisma.$transaction(async tx => {
		const feeItemsData = feeItems.map((item: any) => ({
			...item,
			feeStructureId: existing.id,
		}))

		await feeItemDB.deleteMany(
			existing.feeItems.map(item => item.id),
			tx,
		)
		await feeItemDB.createMany(feeItemsData, tx)
		await feeStructureDB.update(id, restData, tx)
		return true
	})

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.FEE_STRUCTURES.TAG(existing.tenantId),
	])

	return result
}

export async function deleteFeeStructureService({ id }: { id: string }) {
	const existing = await feeStructureDB.getFeeStructureById(id)
	if (!existing) {
		throw new Error('Fee Structure not found')
	}

	await feeStructureDB.delete(id) //cascade delete feeItems

	await nextjsCacheService.invalidate([
		CACHE_KEYS.FEE_STRUCTURES.TAG(existing.tenantId),
	])
}
