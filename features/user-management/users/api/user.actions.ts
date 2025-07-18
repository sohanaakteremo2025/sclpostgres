'use server'
import { CreateUserPayload, UpdateUserInput } from '@/lib/zod'
import {
	createUserService,
	updateUserService,
	deleteUserService,
	getUserByIdService,
	getAllUsersService,
	getUserByEmailService,
	getUserByTenantIdService,
} from '../services/user.service'

export const createUser = async (data: CreateUserPayload) => {
	return await createUserService(data)
}

export const updateUser = async (id: string, data: UpdateUserInput) => {
	return await updateUserService(id, data)
}

export const deleteUser = async (id: string) => {
	return await deleteUserService(id)
}

export const getUserById = async (id: string) => {
	return await getUserByIdService(id)
}

export const getAllUsers = async () => {
	return await getAllUsersService()
}

export const getUserByEmail = async (email: string) => {
	return await getUserByEmailService(email)
}

export const getUserByTenantId = async (tenantId: string) => {
	return await getUserByTenantIdService(tenantId)
}
