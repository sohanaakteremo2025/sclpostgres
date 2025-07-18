import { z } from 'zod'

export const ClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type Class = z.infer<typeof ClassSchema>

export const CreateClassInputSchema = ClassSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateClassInput = z.infer<typeof CreateClassInputSchema>

export const CreateClassPayloadSchema = CreateClassInputSchema.extend({
  tenantId: z.string(),
})

export type CreateClassPayload = z.infer<typeof CreateClassPayloadSchema>

export const UpdateClassInputSchema = ClassSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateClassInput = z.infer<typeof UpdateClassInputSchema>

