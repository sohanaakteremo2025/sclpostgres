import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { PaymentMethodSchema } from './schemas'

export const StudentPaymentSchema = z.object({
  id: z.string(),
  amount: DecimalSchema,
  method: PaymentMethodSchema,
  reason: z.string().optional(),
  month: z.number().int(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  dueItemId: z.string(),
  paymentTransactionId: z.string().optional(),
})

export type StudentPayment = z.infer<typeof StudentPaymentSchema>

export const CreateStudentPaymentInputSchema = StudentPaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateStudentPaymentInput = z.infer<typeof CreateStudentPaymentInputSchema>

export const CreateStudentPaymentPayloadSchema = CreateStudentPaymentInputSchema.extend({
  tenantId: z.string(),
})

export type CreateStudentPaymentPayload = z.infer<typeof CreateStudentPaymentPayloadSchema>

export const UpdateStudentPaymentInputSchema = StudentPaymentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateStudentPaymentInput = z.infer<typeof UpdateStudentPaymentInputSchema>

