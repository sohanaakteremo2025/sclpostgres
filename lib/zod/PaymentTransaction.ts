import { z } from 'zod'
import { DecimalSchema } from './schemas'

export const PaymentTransactionSchema = z.object({
  id: z.string(),
  totalAmount: DecimalSchema,
  collectedBy: z.string().optional(),
  transactionDate: z.date().optional(),
  printCount: z.number().int().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  studentId: z.string(),
})

export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>

export const CreatePaymentTransactionInputSchema = PaymentTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreatePaymentTransactionInput = z.infer<typeof CreatePaymentTransactionInputSchema>

export const CreatePaymentTransactionPayloadSchema = CreatePaymentTransactionInputSchema.extend({
  tenantId: z.string(),
})

export type CreatePaymentTransactionPayload = z.infer<typeof CreatePaymentTransactionPayloadSchema>

export const UpdatePaymentTransactionInputSchema = PaymentTransactionSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdatePaymentTransactionInput = z.infer<typeof UpdatePaymentTransactionInputSchema>

