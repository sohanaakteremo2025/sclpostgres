// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { noticeDB } from '../db/notice.repository'
import { CreateNoticePayload, UpdateNoticeInput } from '@/lib/zod'

export async function createNoticeService({
	data,
}: {
	data: CreateNoticePayload
}) {
	const result = await noticeDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.NOTICES.TAG(data.tenantId)])

	return result
}

export async function getAllNoticesService({ tenantId }: { tenantId: string }) {
	return await nextjsCacheService.cached(
		() => noticeDB.getAllNotices(tenantId),
		{
			key: CACHE_KEYS.NOTICES.KEY(tenantId),
			tags: [CACHE_KEYS.NOTICES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getNoticeByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => noticeDB.getNoticeById(id), {
		key: CACHE_KEYS.NOTICES.KEY(id),
		tags: [CACHE_KEYS.NOTICES.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateNoticeService({
	id,
	data,
}: {
	id: string
	data: UpdateNoticeInput
}) {
	const existing = await noticeDB.getNoticeById(id)
	if (!existing) {
		throw new Error('Notice not found')
	}

	const result = await noticeDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.NOTICES.TAG(existing.tenantId),
		CACHE_KEYS.NOTICE.TAG(id),
	])

	return result
}

export async function deleteNoticeService({ id }: { id: string }) {
	const existing = await noticeDB.getNoticeById(id)
	if (!existing) {
		throw new Error('Notice not found')
	}

	await noticeDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.NOTICES.TAG(existing.tenantId),
		CACHE_KEYS.NOTICE.TAG(id),
	])
}
