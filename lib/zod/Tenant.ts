import { z } from 'zod'
import { TenantStatusSchema } from './schemas'

export const TenantSchema = z.object({
  id: z.string(),
  logo: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  domain: z.string(),
  status: TenantStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Tenant = z.infer<typeof TenantSchema>

export const CreateTenantInputSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>

export const CreateTenantPayloadSchema = CreateTenantInputSchema

export type CreateTenantPayload = CreateTenantInput

export const UpdateTenantInputSchema = TenantSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantInput = z.infer<typeof UpdateTenantInputSchema>

