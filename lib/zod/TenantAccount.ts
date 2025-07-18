import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { AccountTypeSchema } from './schemas'

export const TenantAccountSchema = z.object({
  id: z.string(),
  title: z.string(),
  balance: DecimalSchema,
  type: AccountTypeSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type TenantAccount = z.infer<typeof TenantAccountSchema>

export const CreateTenantAccountInputSchema = TenantAccountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTenantAccountInput = z.infer<typeof CreateTenantAccountInputSchema>

export const CreateTenantAccountPayloadSchema = CreateTenantAccountInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTenantAccountPayload = z.infer<typeof CreateTenantAccountPayloadSchema>

export const UpdateTenantAccountInputSchema = TenantAccountSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantAccountInput = z.infer<typeof UpdateTenantAccountInputSchema>

