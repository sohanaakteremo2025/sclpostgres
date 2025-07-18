// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { subjectDB } from '../db/subject.repository'
import { CreateSubjectPayload, UpdateSubjectInput } from '@/lib/zod'

export async function createSubjectService({
	data,
}: {
	data: CreateSubjectPayload
}) {
	const result = await subjectDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.SUBJECTS.TAG(data.tenantId)])

	return result
}

export async function getAllSubjectsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => subjectDB.getAllSubjects(tenantId),
		{
			key: CACHE_KEYS.SUBJECTS.KEY(tenantId),
			tags: [CACHE_KEYS.SUBJECTS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getSubjectByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => subjectDB.getSubjectById(id), {
		key: CACHE_KEYS.SUBJECT.KEY(id),
		tags: [CACHE_KEYS.SUBJECT.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateSubjectService({
	id,
	data,
}: {
	id: string
	data: UpdateSubjectInput
}) {
	const existing = await subjectDB.getSubjectById(id)
	if (!existing) {
		throw new Error('Subject not found')
	}

	const result = await subjectDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.SUBJECTS.TAG(existing.tenantId),
		CACHE_KEYS.SUBJECT.TAG(id),
	])

	return result
}

export async function deleteSubjectService({ id }: { id: string }) {
	const existing = await subjectDB.getSubjectById(id)
	if (!existing) {
		throw new Error('Subject not found')
	}

	await subjectDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.SUBJECTS.TAG(existing.tenantId),
		CACHE_KEYS.SUBJECT.TAG(id),
	])
}

export async function getSubjectsByClassOrSectionService({
	classId,
	sectionId,
}: {
	classId?: string
	sectionId?: string
}) {
	return await subjectDB.getSubjectsByClassOrSection(classId, sectionId)
}

export async function getSubjectsByClassIdService({
	classId,
}: {
	classId?: string
}) {
	return await subjectDB.getSubjectsByClassId(classId)
}

export async function getSubjectsBySectionService({
	sectionId,
}: {
	sectionId?: string
}) {
	return await subjectDB.getSubjectsBySection(sectionId)
}
