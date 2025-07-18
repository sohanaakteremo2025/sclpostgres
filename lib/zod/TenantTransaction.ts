import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { TransactionTypeSchema } from './schemas'

export const TenantTransactionSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: DecimalSchema,
  note: z.string().optional(),
  type: TransactionTypeSchema,
  transactionBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
})

export type TenantTransaction = z.infer<typeof TenantTransactionSchema>

export const CreateTenantTransactionInputSchema = TenantTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTenantTransactionInput = z.infer<typeof CreateTenantTransactionInputSchema>

export const CreateTenantTransactionPayloadSchema = CreateTenantTransactionInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTenantTransactionPayload = z.infer<typeof CreateTenantTransactionPayloadSchema>

export const UpdateTenantTransactionInputSchema = TenantTransactionSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantTransactionInput = z.infer<typeof UpdateTenantTransactionInputSchema>

