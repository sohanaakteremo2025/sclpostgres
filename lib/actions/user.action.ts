'use server'

import { ActionResponse } from '@/types/api'
import { UserRole, UserStatus } from '@prisma/client'
import { prisma } from '../db'

export type GetUserByEmailResponseType = {
	id: string
	name: string
	email: string
	password: string
	role: UserRole
	status: UserStatus
	domain: string | undefined
	tenantId: string | undefined
	photo?: string
	createdAt: Date
	updatedAt: Date
}

export const getUserByEmail = async (
	email: string,
): Promise<ActionResponse<GetUserByEmailResponseType>> => {
	try {
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				tenant: true,
			},
		})
		if (!user) {
			return {
				success: false,
				message: 'User not found',
			}
		}
		return {
			data: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				domain: user.tenant?.domain || '',
				photo: user.photo || '',
				password: user.password || '',
				status: user.status,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				tenantId: user.tenantId || undefined,
			},
			success: true,
			message: 'User found',
		}
	} catch {
		return {
			success: false,
			message: 'User not found',
		}
	}
}
