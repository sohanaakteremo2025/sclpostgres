import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { FeeFrequencySchema, LateFeeFrequencySchema, FeeItemStatusSchema } from './schemas'

export const FeeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: DecimalSchema,
  categoryId: z.string().optional(),
  description: z.string().optional(),
  frequency: FeeFrequencySchema,
  lateFeeEnabled: z.boolean(),
  lateFeeFrequency: LateFeeFrequencySchema.optional(),
  lateFeeAmount: DecimalSchema.optional(),
  lateFeeGraceDays: z.number().int().optional(),
  status: FeeItemStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  feeStructureId: z.string(),
  transactionCategoryId: z.string().optional(),
})

export type FeeItem = z.infer<typeof FeeItemSchema>

export const CreateFeeItemInputSchema = FeeItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateFeeItemInput = z.infer<typeof CreateFeeItemInputSchema>

export const CreateFeeItemPayloadSchema = CreateFeeItemInputSchema

export type CreateFeeItemPayload = CreateFeeItemInput

export const UpdateFeeItemInputSchema = FeeItemSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateFeeItemInput = z.infer<typeof UpdateFeeItemInputSchema>

