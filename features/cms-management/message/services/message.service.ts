// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CreateTenantMessagePayload, UpdateTenantMessageInput } from '@/lib/zod'
import { messageDB } from '../db/message.repository'

async function createMessageService({
	data,
}: {
	data: CreateTenantMessagePayload
}) {
	const result = await messageDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])

	return result
}

async function createManyMessagesService({
	data,
}: {
	data: CreateTenantMessagePayload[]
}) {
	const result = await messageDB.createManyMessages(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])

	return result
}

async function getAllMessagesService() {
	return await nextjsCacheService.cached(() => messageDB.getAllMessages(), {
		key: CACHE_KEYS.TENANTS.BASE,
		tags: [CACHE_KEYS.TENANTS.TAG],
		revalidate: 300, // 5 minutes
	})
}

async function updateMessageService({
	id,
	data,
}: {
	id: string
	data: UpdateTenantMessageInput
}) {
	const existing = await messageDB.getMessageById(id)
	if (!existing) {
		throw new Error('Message not found')
	}

	const result = await messageDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])

	return result
}

async function deleteMessageService({ id }: { id: string }) {
	const existing = await messageDB.getMessageById(id)
	if (!existing) {
		throw new Error('Message not found')
	}

	await messageDB.delete(id)

	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])
}

export const messageService = {
	create: createMessageService,
	createMany: createManyMessagesService,
	getAll: getAllMessagesService,
	update: updateMessageService,
	delete: deleteMessageService,
}
