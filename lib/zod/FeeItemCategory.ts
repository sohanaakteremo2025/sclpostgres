import { z } from 'zod'

export const FeeItemCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  note: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type FeeItemCategory = z.infer<typeof FeeItemCategorySchema>

export const CreateFeeItemCategoryInputSchema = FeeItemCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateFeeItemCategoryInput = z.infer<typeof CreateFeeItemCategoryInputSchema>

export const CreateFeeItemCategoryPayloadSchema = CreateFeeItemCategoryInputSchema.extend({
  tenantId: z.string(),
})

export type CreateFeeItemCategoryPayload = z.infer<typeof CreateFeeItemCategoryPayloadSchema>

export const UpdateFeeItemCategoryInputSchema = FeeItemCategorySchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateFeeItemCategoryInput = z.infer<typeof UpdateFeeItemCategoryInputSchema>

