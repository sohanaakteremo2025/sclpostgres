// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { classRoutineDB } from '../db/classRoutine.repository'
import { CreateClassRoutinePayload, UpdateClassRoutineInput } from '@/lib/zod'

export async function createClassRoutineService({
	data,
}: {
	data: CreateClassRoutinePayload
}) {
	const result = await classRoutineDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASS_ROUTINES.TAG(data.tenantId),
	])

	return result
}

export async function getAllClassRoutinesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => classRoutineDB.getAllClassRoutines(tenantId),
		{
			key: CACHE_KEYS.CLASS_ROUTINES.KEY(tenantId),
			tags: [CACHE_KEYS.CLASS_ROUTINES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getClassRoutineByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => classRoutineDB.getClassRoutineById(id),
		{
			key: CACHE_KEYS.CLASS_ROUTINES.KEY(id),
			tags: [CACHE_KEYS.CLASS_ROUTINES.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateClassRoutineService({
	id,
	data,
}: {
	id: string
	data: UpdateClassRoutineInput
}) {
	const existing = await classRoutineDB.getClassRoutineById(id)
	if (!existing) {
		throw new Error('Class Routine not found')
	}

	const result = await classRoutineDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASS_ROUTINES.TAG(existing.tenantId),
		CACHE_KEYS.CLASS_ROUTINES.TAG(id),
	])

	return result
}

export async function deleteClassRoutineService({ id }: { id: string }) {
	const existing = await classRoutineDB.getClassRoutineById(id)
	if (!existing) {
		throw new Error('Class Routine not found')
	}

	await classRoutineDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASS_ROUTINES.TAG(existing.tenantId),
		CACHE_KEYS.CLASS_ROUTINES.TAG(id),
	])
}
