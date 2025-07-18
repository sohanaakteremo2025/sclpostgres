import { z } from 'zod'

export const SectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  classId: z.string(),
})

export type Section = z.infer<typeof SectionSchema>

export const CreateSectionInputSchema = SectionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateSectionInput = z.infer<typeof CreateSectionInputSchema>

export const CreateSectionPayloadSchema = CreateSectionInputSchema.extend({
  tenantId: z.string(),
})

export type CreateSectionPayload = z.infer<typeof CreateSectionPayloadSchema>

export const UpdateSectionInputSchema = SectionSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateSectionInput = z.infer<typeof UpdateSectionInputSchema>

