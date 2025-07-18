import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { DueItemStatusSchema } from './schemas'

export const DueItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  originalAmount: DecimalSchema,
  finalAmount: DecimalSchema,
  paidAmount: DecimalSchema,
  description: z.string().optional(),
  status: DueItemStatusSchema,
  categoryId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  dueId: z.string(),
  transactionCategoryId: z.string().optional(),
})

export type DueItem = z.infer<typeof DueItemSchema>

export const CreateDueItemInputSchema = DueItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateDueItemInput = z.infer<typeof CreateDueItemInputSchema>

export const CreateDueItemPayloadSchema = CreateDueItemInputSchema.extend({
  tenantId: z.string(),
})

export type CreateDueItemPayload = z.infer<typeof CreateDueItemPayloadSchema>

export const UpdateDueItemInputSchema = DueItemSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateDueItemInput = z.infer<typeof UpdateDueItemInputSchema>

