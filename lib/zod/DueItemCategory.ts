import { z } from 'zod'

export const DueItemCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  note: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type DueItemCategory = z.infer<typeof DueItemCategorySchema>

export const CreateDueItemCategoryInputSchema = DueItemCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateDueItemCategoryInput = z.infer<typeof CreateDueItemCategoryInputSchema>

export const CreateDueItemCategoryPayloadSchema = CreateDueItemCategoryInputSchema.extend({
  tenantId: z.string(),
})

export type CreateDueItemCategoryPayload = z.infer<typeof CreateDueItemCategoryPayloadSchema>

export const UpdateDueItemCategoryInputSchema = DueItemCategorySchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateDueItemCategoryInput = z.infer<typeof UpdateDueItemCategoryInputSchema>

