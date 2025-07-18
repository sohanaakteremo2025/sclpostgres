// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { classDB } from '../db/class.repository'
import { CreateClassPayload, UpdateClassInput } from '@/lib/zod'

export async function createClassService({
	data,
}: {
	data: CreateClassPayload
}) {
	const result = await classDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.CLASSES.TAG(data.tenantId)])

	return result
}

export async function getAllClassesService({ tenantId }: { tenantId: string }) {
	return await nextjsCacheService.cached(
		() => classDB.getAllClasses(tenantId),
		{
			key: CACHE_KEYS.CLASSES.KEY(tenantId),
			tags: [CACHE_KEYS.CLASSES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getClassByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => classDB.getClassById(id), {
		key: CACHE_KEYS.CLASS.KEY(id),
		tags: [CACHE_KEYS.CLASS.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateClassService({
	id,
	data,
}: {
	id: string
	data: UpdateClassInput
}) {
	const existing = await classDB.getClassById(id)
	if (!existing) {
		throw new Error('Class not found')
	}

	const result = await classDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASSES.TAG(existing.tenantId),
		CACHE_KEYS.CLASS.TAG(id),
	])

	return result
}

export async function deleteClassService({ id }: { id: string }) {
	const existing = await classDB.getClassById(id)
	if (!existing) {
		throw new Error('Class not found')
	}

	await classDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASSES.TAG(existing.tenantId),
		CACHE_KEYS.CLASS.TAG(id),
	])
}
