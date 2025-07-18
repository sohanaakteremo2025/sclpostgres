import { CreateSectionPayload, UpdateSectionInput } from '@/lib/zod'
import { sectionDB } from '../db/section.repository'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CACHE_KEYS } from '@/constants/cache'

export const getSectionsByClassIdService = async (classId: string) => {
	const sections = await sectionDB.getSectionsByClassId(classId)
	return sections
}

export const createSectionService = async (data: CreateSectionPayload) => {
	const result = await sectionDB.createSection(data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASSES.TAG(data.tenantId),
		CACHE_KEYS.SECTIONS.TAG(data.tenantId),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(data.tenantId),
	])

	return result
}

export const updateSectionService = async (
	id: string,
	data: UpdateSectionInput,
) => {
	const result = await sectionDB.updateSection(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASSES.TAG(data.tenantId),
		CACHE_KEYS.SECTIONS.TAG(data.tenantId),
	])

	return result
}

export const deleteSectionService = async ({
	id,
	tenantId,
}: {
	id: string
	tenantId: string
}) => {
	await sectionDB.deleteSection(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.CLASSES.TAG(tenantId),
		CACHE_KEYS.SECTIONS.TAG(tenantId),
	])
}
