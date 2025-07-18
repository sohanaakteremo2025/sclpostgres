import { prisma } from '@/lib/db'
import { CreateUserPayload, UpdateUserInput } from '@/lib/zod'
import { TransactionClient } from '@/types'

async function createUser(data: CreateUserPayload, tx?: TransactionClient) {
	const client = tx || prisma
	return await client.user.create({ data })
}

async function updateUser(id: string, data: UpdateUserInput) {
	return await prisma.user.update({ where: { id }, data })
}

async function deleteUser(id: string) {
	return await prisma.user.delete({ where: { id } })
}

async function getUserById(id: string) {
	return await prisma.user.findUnique({ where: { id } })
}

async function getAllUsers() {
	return await prisma.user.findMany()
}

async function getUserByEmail(email: string) {
	return await prisma.user.findUnique({ where: { email } })
}

async function getUserByTenantId(tenantId: string) {
	return await prisma.user.findMany({ where: { tenantId } })
}

export const userDB = {
	createUser,
	updateUser,
	deleteUser,
	getUserById,
	getAllUsers,
	getUserByEmail,
	getUserByTenantId,
}
