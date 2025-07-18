import { z } from 'zod'

export const TenantMessageSchema = z.object({
  id: z.string(),
  author: z.string(),
  title: z.string(),
  message: z.string(),
  photo: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type TenantMessage = z.infer<typeof TenantMessageSchema>

export const CreateTenantMessageInputSchema = TenantMessageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTenantMessageInput = z.infer<typeof CreateTenantMessageInputSchema>

export const CreateTenantMessagePayloadSchema = CreateTenantMessageInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTenantMessagePayload = z.infer<typeof CreateTenantMessagePayloadSchema>

export const UpdateTenantMessageInputSchema = TenantMessageSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantMessageInput = z.infer<typeof UpdateTenantMessageInputSchema>

