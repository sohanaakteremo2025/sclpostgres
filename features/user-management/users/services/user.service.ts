import { CreateUserPayload, UpdateUserInput } from '@/lib/zod'
import { userDB } from '../db/user.repository'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CACHE_KEYS } from '@/constants/cache'

export const createUserService = async (data: CreateUserPayload) => {
	const user = await userDB.createUser(data)
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ADMINS.TAG,
		CACHE_KEYS.TENANTS.TAG,
	])
	return user
}

export const updateUserService = async (id: string, data: UpdateUserInput) => {
	await userDB.updateUser(id, data)
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ADMINS.TAG,
		CACHE_KEYS.TENANTS.TAG,
	])
	return await userDB.getUserById(id)
}

export const deleteUserService = async (id: string) => {
	await userDB.deleteUser(id)
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ADMINS.TAG,
		CACHE_KEYS.TENANTS.TAG,
	])
	return await userDB.getUserById(id)
}

export const getUserByIdService = async (id: string) => {
	return await userDB.getUserById(id)
}

export const getAllUsersService = async () => {
	return await userDB.getAllUsers()
}

export const getUserByEmailService = async (email: string) => {
	return await userDB.getUserByEmail(email)
}

export const getUserByTenantIdService = async (tenantId: string) => {
	return await userDB.getUserByTenantId(tenantId)
}
