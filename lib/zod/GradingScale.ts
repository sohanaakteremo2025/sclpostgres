import { z } from 'zod'

export const GradingScaleSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantId: z.string(),
})

export type GradingScale = z.infer<typeof GradingScaleSchema>

export const CreateGradingScaleInputSchema = GradingScaleSchema.omit({
  id: true,
  tenantId: true,
})

export type CreateGradingScaleInput = z.infer<typeof CreateGradingScaleInputSchema>

export const CreateGradingScalePayloadSchema = CreateGradingScaleInputSchema.extend({
  tenantId: z.string(),
})

export type CreateGradingScalePayload = z.infer<typeof CreateGradingScalePayloadSchema>

export const UpdateGradingScaleInputSchema = GradingScaleSchema

export type UpdateGradingScaleInput = z.infer<typeof UpdateGradingScaleInputSchema>

