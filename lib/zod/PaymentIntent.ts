import { z } from 'zod'
import { DecimalSchema } from './schemas'

export const PaymentIntentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  studentId: z.string(),
  amount: DecimalSchema,
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>

export const CreatePaymentIntentInputSchema = PaymentIntentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentInputSchema>

export const CreatePaymentIntentPayloadSchema = CreatePaymentIntentInputSchema

export type CreatePaymentIntentPayload = CreatePaymentIntentInput

export const UpdatePaymentIntentInputSchema = PaymentIntentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdatePaymentIntentInput = z.infer<typeof UpdatePaymentIntentInputSchema>

