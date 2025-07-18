import * as z from 'zod'
import { UserSchema } from '@/schema'
import { createFormSchemas } from '@/lib/zod-schema-utils'
import { UserRole, UserStatus } from '@prisma/client'

// First, let's get the base schemas
export const TenantAdminSchemas = createFormSchemas(UserSchema, {
	requiredFields: ['name', 'email', 'password', 'role', 'tenantId'],
	createExclude: ['id', 'createdAt', 'updatedAt'],
	updateExclude: ['id', 'createdAt', 'updatedAt', 'password'],
	customValidation: {
		password: z
			.string()
			.min(6, 'Password must be at least 6 characters')
			.transform(val => val.trim()),
		email: z.string().email('Invalid email address'),
		tenantId: z.string().min(1, 'Tenant is required'),
		role: z.literal(UserRole.ADMIN),
		status: z.literal(UserStatus.ACTIVE).default(UserStatus.ACTIVE),
	},
})

export const createTenantAdminSchema = TenantAdminSchemas.createSchema
export const updateTenantAdminSchema = TenantAdminSchemas.updateSchema

export type CreateTenantAdminInput = z.infer<typeof createTenantAdminSchema>
export type UpdateTenantAdminInput = z.infer<typeof updateTenantAdminSchema>
