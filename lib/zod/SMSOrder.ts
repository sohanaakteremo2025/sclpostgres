import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { SMSOrderStatusSchema, PaymentMethodSchema } from './schemas'

export const SMSOrderSchema = z.object({
  id: z.string(),
  credits: z.number().int(),
  amount: DecimalSchema,
  trxId: z.string(),
  status: SMSOrderStatusSchema,
  method: PaymentMethodSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type SMSOrder = z.infer<typeof SMSOrderSchema>

export const CreateSMSOrderInputSchema = SMSOrderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateSMSOrderInput = z.infer<typeof CreateSMSOrderInputSchema>

export const CreateSMSOrderPayloadSchema = CreateSMSOrderInputSchema.extend({
  tenantId: z.string(),
})

export type CreateSMSOrderPayload = z.infer<typeof CreateSMSOrderPayloadSchema>

export const UpdateSMSOrderInputSchema = SMSOrderSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateSMSOrderInput = z.infer<typeof UpdateSMSOrderInputSchema>

