import { z } from 'zod'

export const TransactionCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type TransactionCategory = z.infer<typeof TransactionCategorySchema>

export const CreateTransactionCategoryInputSchema = TransactionCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTransactionCategoryInput = z.infer<typeof CreateTransactionCategoryInputSchema>

export const CreateTransactionCategoryPayloadSchema = CreateTransactionCategoryInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTransactionCategoryPayload = z.infer<typeof CreateTransactionCategoryPayloadSchema>

export const UpdateTransactionCategoryInputSchema = TransactionCategorySchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTransactionCategoryInput = z.infer<typeof UpdateTransactionCategoryInputSchema>

