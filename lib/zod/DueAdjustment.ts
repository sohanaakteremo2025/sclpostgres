import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { DueAdjustmentTypeSchema, DueAdjustmentStatusSchema } from './schemas'

export const DueAdjustmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: DecimalSchema,
  type: DueAdjustmentTypeSchema,
  categoryId: z.string().optional(),
  status: DueAdjustmentStatusSchema,
  reason: z.string().optional(),
  appliedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  dueItemId: z.string(),
})

export type DueAdjustment = z.infer<typeof DueAdjustmentSchema>

export const CreateDueAdjustmentInputSchema = DueAdjustmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateDueAdjustmentInput = z.infer<typeof CreateDueAdjustmentInputSchema>

export const CreateDueAdjustmentPayloadSchema = CreateDueAdjustmentInputSchema.extend({
  tenantId: z.string(),
})

export type CreateDueAdjustmentPayload = z.infer<typeof CreateDueAdjustmentPayloadSchema>

export const UpdateDueAdjustmentInputSchema = DueAdjustmentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateDueAdjustmentInput = z.infer<typeof UpdateDueAdjustmentInputSchema>

