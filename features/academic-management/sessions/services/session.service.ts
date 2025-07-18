// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { sessionDB } from '../db/session.repository'
import {
	CreateAcademicSessionPayload,
	UpdateAcademicSessionInput,
} from '@/lib/zod'

export async function createSessionService({
	data,
}: {
	data: CreateAcademicSessionPayload
}) {
	const result = await sessionDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.SESSIONS.TAG(data.tenantId),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(data.tenantId),
	])

	return result
}

export async function getAllSessionsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => sessionDB.getAllSessions(tenantId),
		{
			key: CACHE_KEYS.SESSIONS.KEY(tenantId),
			tags: [CACHE_KEYS.SESSIONS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getSessionByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => sessionDB.getSessionById(id), {
		key: CACHE_KEYS.SESSION.KEY(id),
		tags: [CACHE_KEYS.SESSION.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateSessionService({
	id,
	data,
}: {
	id: string
	data: UpdateAcademicSessionInput
}) {
	const existing = await sessionDB.getSessionById(id)
	if (!existing) {
		throw new Error('Session not found')
	}

	const result = await sessionDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.SESSIONS.TAG(existing.tenantId),
		CACHE_KEYS.SESSION.TAG(id),
	])

	return result
}

export async function deleteSessionService({ id }: { id: string }) {
	const existing = await sessionDB.getSessionById(id)
	if (!existing) {
		throw new Error('Session not found')
	}

	await sessionDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.SESSIONS.TAG(existing.tenantId),
		CACHE_KEYS.SESSION.TAG(id),
	])
}
