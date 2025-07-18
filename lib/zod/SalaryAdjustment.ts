import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { SalaryAdjustmentTypeSchema } from './schemas'

export const SalaryAdjustmentSchema = z.object({
  id: z.string(),
  amount: DecimalSchema,
  type: SalaryAdjustmentTypeSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  dueItemId: z.string(),
})

export type SalaryAdjustment = z.infer<typeof SalaryAdjustmentSchema>

export const CreateSalaryAdjustmentInputSchema = SalaryAdjustmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateSalaryAdjustmentInput = z.infer<typeof CreateSalaryAdjustmentInputSchema>

export const CreateSalaryAdjustmentPayloadSchema = CreateSalaryAdjustmentInputSchema

export type CreateSalaryAdjustmentPayload = CreateSalaryAdjustmentInput

export const UpdateSalaryAdjustmentInputSchema = SalaryAdjustmentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateSalaryAdjustmentInput = z.infer<typeof UpdateSalaryAdjustmentInputSchema>

