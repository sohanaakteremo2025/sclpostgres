'use server'

import { CreateTenantMessagePayload, UpdateTenantMessageInput } from '@/lib/zod'
import { messageService } from '../services/message.service'

export async function createMessage(data: CreateTenantMessagePayload) {
	return await messageService.create({
		data,
	})
}

export async function getAllMessages() {
	return await messageService.getAll()
}

export async function updateMessage(
	id: string,
	data: UpdateTenantMessageInput,
) {
	return await messageService.update({
		id,
		data,
	})
}

export async function deleteMessage(id: string) {
	return await messageService.delete({
		id,
	})
}
