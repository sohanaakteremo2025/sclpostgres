import { z } from 'zod'

export const DiscountCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  note: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type DiscountCategory = z.infer<typeof DiscountCategorySchema>

export const CreateDiscountCategoryInputSchema = DiscountCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateDiscountCategoryInput = z.infer<typeof CreateDiscountCategoryInputSchema>

export const CreateDiscountCategoryPayloadSchema = CreateDiscountCategoryInputSchema.extend({
  tenantId: z.string(),
})

export type CreateDiscountCategoryPayload = z.infer<typeof CreateDiscountCategoryPayloadSchema>

export const UpdateDiscountCategoryInputSchema = DiscountCategorySchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateDiscountCategoryInput = z.infer<typeof UpdateDiscountCategoryInputSchema>

