import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { TransactionTypeSchema, PaymentMethodSchema } from './schemas'

export const CompanyTransactionSchema = z.object({
  id: z.string(),
  type: TransactionTypeSchema,
  category: z.string(),
  amount: DecimalSchema,
  reason: z.string(),
  method: PaymentMethodSchema,
  transactionBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CompanyTransaction = z.infer<typeof CompanyTransactionSchema>

export const CreateCompanyTransactionInputSchema = CompanyTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateCompanyTransactionInput = z.infer<typeof CreateCompanyTransactionInputSchema>

export const CreateCompanyTransactionPayloadSchema = CreateCompanyTransactionInputSchema

export type CreateCompanyTransactionPayload = CreateCompanyTransactionInput

export const UpdateCompanyTransactionInputSchema = CompanyTransactionSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateCompanyTransactionInput = z.infer<typeof UpdateCompanyTransactionInputSchema>

