// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { examDB } from '../db/exam.repository'
import { CreateExamPayload, UpdateExamInput } from '@/lib/zod'

export async function createExamService({ data }: { data: CreateExamPayload }) {
	const result = await examDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.EXAMS.TAG(data.tenantId)])

	return result
}

export async function getAllExamsService({ tenantId }: { tenantId: string }) {
	return await nextjsCacheService.cached(() => examDB.getAllExams(tenantId), {
		key: CACHE_KEYS.EXAMS.KEY(tenantId),
		tags: [CACHE_KEYS.EXAMS.TAG(tenantId)],
		revalidate: 300, // 5 minutes
	})
}

export async function getExamByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => examDB.getExamById(id), {
		key: CACHE_KEYS.EXAM.KEY(id),
		tags: [CACHE_KEYS.EXAM.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateExamService({
	id,
	data,
}: {
	id: string
	data: UpdateExamInput
}) {
	const existing = await examDB.getExamById(id)
	if (!existing) {
		throw new Error('Exam not found')
	}

	const result = await examDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.EXAMS.TAG(existing.tenantId),
		CACHE_KEYS.EXAM.TAG(id),
	])

	return result
}

export async function deleteExamService({ id }: { id: string }) {
	const existing = await examDB.getExamById(id)
	if (!existing) {
		throw new Error('Exam not found')
	}

	await examDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.EXAMS.TAG(existing.tenantId),
		CACHE_KEYS.EXAM.TAG(id),
	])
}
