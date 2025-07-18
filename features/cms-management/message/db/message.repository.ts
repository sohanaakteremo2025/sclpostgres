//tenantDB
import { prisma } from '@/lib/db'
import { CreateTenantMessagePayload, UpdateTenantMessageInput } from '@/lib/zod'

async function create(data: CreateTenantMessagePayload) {
	return await prisma.tenantMessage.create({ data })
}

async function createManyMessages(data: CreateTenantMessagePayload[]) {
	return await prisma.tenantMessage.createMany({ data })
}

async function update(id: string, data: UpdateTenantMessageInput) {
	return await prisma.tenantMessage.update({ where: { id }, data })
}

async function deleteMessage(id: string) {
	return await prisma.tenantMessage.delete({ where: { id } })
}

async function deleteManyMessages(tenantId: string) {
	return await prisma.tenantMessage.deleteMany({ where: { tenantId } })
}

async function getAllMessages() {
	return await prisma.tenantMessage.findMany({
		orderBy: { createdAt: 'asc' },
	})
}

async function getMessageById(id: string) {
	return await prisma.tenantMessage.findUnique({ where: { id } })
}

export const messageDB = {
	create,
	createManyMessages,
	update,
	delete: deleteMessage,
	deleteManyMessages,
	getAllMessages,
	getMessageById,
}
