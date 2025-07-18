import { z } from 'zod'
import { UserRoleSchema, UserStatusSchema } from './schemas'

export const UserSchema = z.object({
  id: z.string(),
  photo: z.string().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>

export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>

export const CreateUserPayloadSchema = CreateUserInputSchema.extend({
  tenantId: z.string().optional(),
})

export type CreateUserPayload = z.infer<typeof CreateUserPayloadSchema>

export const UpdateUserInputSchema = UserSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>

