import { UserRole } from '@prisma/client'

export type UserSession = {
	id: string
	photo?: string
	name: string
	email: string
	role: UserRole
	domain?: string
	tenantId?: string
}
