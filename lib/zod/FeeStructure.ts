import { z } from 'zod'

export const FeeStructureSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type FeeStructure = z.infer<typeof FeeStructureSchema>

export const CreateFeeStructureInputSchema = FeeStructureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateFeeStructureInput = z.infer<typeof CreateFeeStructureInputSchema>

export const CreateFeeStructurePayloadSchema = CreateFeeStructureInputSchema.extend({
  tenantId: z.string(),
})

export type CreateFeeStructurePayload = z.infer<typeof CreateFeeStructurePayloadSchema>

export const UpdateFeeStructureInputSchema = FeeStructureSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateFeeStructureInput = z.infer<typeof UpdateFeeStructureInputSchema>

