import { z } from 'zod'
import { DecimalSchema } from './schemas'

export const SalaryDueItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: DecimalSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  dueId: z.string(),
})

export type SalaryDueItem = z.infer<typeof SalaryDueItemSchema>

export const CreateSalaryDueItemInputSchema = SalaryDueItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateSalaryDueItemInput = z.infer<typeof CreateSalaryDueItemInputSchema>

export const CreateSalaryDueItemPayloadSchema = CreateSalaryDueItemInputSchema

export type CreateSalaryDueItemPayload = CreateSalaryDueItemInput

export const UpdateSalaryDueItemInputSchema = SalaryDueItemSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateSalaryDueItemInput = z.infer<typeof UpdateSalaryDueItemInputSchema>

