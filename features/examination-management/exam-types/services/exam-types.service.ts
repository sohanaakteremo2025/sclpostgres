// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { examTypeDB } from '../db/examSchedules.repository'
import { CreateExamTypePayload, UpdateExamTypeInput } from '@/lib/zod'

export async function createExamTypeService({
	data,
}: {
	data: CreateExamTypePayload
}) {
	const result = await examTypeDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.EXAM_TYPES.TAG(data.tenantId),
	])

	return result
}

export async function getAllExamTypesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => examTypeDB.getAllExamTypes(tenantId),
		{
			key: CACHE_KEYS.EXAM_TYPES.KEY(tenantId),
			tags: [CACHE_KEYS.EXAM_TYPES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getExamTypeByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => examTypeDB.getExamTypeById(id), {
		key: CACHE_KEYS.EXAM_TYPES.KEY(id),
		tags: [CACHE_KEYS.EXAM_TYPES.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateExamTypeService({
	id,
	data,
}: {
	id: string
	data: UpdateExamTypeInput
}) {
	const existing = await examTypeDB.getExamTypeById(id)
	if (!existing) {
		throw new Error('Exam Type not found')
	}

	const result = await examTypeDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.EXAM_TYPES.TAG(existing.tenantId),
		CACHE_KEYS.EXAM_TYPE.TAG(id),
	])

	return result
}

export async function deleteExamTypeService({ id }: { id: string }) {
	const existing = await examTypeDB.getExamTypeById(id)
	if (!existing) {
		throw new Error('Exam Type not found')
	}

	await examTypeDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.EXAM_TYPES.TAG(existing.tenantId),
		CACHE_KEYS.EXAM_TYPE.TAG(id),
	])
}
