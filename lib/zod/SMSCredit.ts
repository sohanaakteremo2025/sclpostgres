import { z } from 'zod'

export const SMSCreditSchema = z.object({
  id: z.string(),
  credits: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type SMSCredit = z.infer<typeof SMSCreditSchema>

export const CreateSMSCreditInputSchema = SMSCreditSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateSMSCreditInput = z.infer<typeof CreateSMSCreditInputSchema>

export const CreateSMSCreditPayloadSchema = CreateSMSCreditInputSchema.extend({
  tenantId: z.string(),
})

export type CreateSMSCreditPayload = z.infer<typeof CreateSMSCreditPayloadSchema>

export const UpdateSMSCreditInputSchema = SMSCreditSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateSMSCreditInput = z.infer<typeof UpdateSMSCreditInputSchema>

