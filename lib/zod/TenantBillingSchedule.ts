import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { BillingFrequencySchema, BillingTypeSchema, BillingStatusSchema } from './schemas'

export const TenantBillingScheduleSchema = z.object({
  id: z.string(),
  label: z.string(),
  frequency: BillingFrequencySchema,
  billingType: BillingTypeSchema,
  amount: DecimalSchema,
  nextDueDate: z.date(),
  status: BillingStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type TenantBillingSchedule = z.infer<typeof TenantBillingScheduleSchema>

export const CreateTenantBillingScheduleInputSchema = TenantBillingScheduleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTenantBillingScheduleInput = z.infer<typeof CreateTenantBillingScheduleInputSchema>

export const CreateTenantBillingSchedulePayloadSchema = CreateTenantBillingScheduleInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTenantBillingSchedulePayload = z.infer<typeof CreateTenantBillingSchedulePayloadSchema>

export const UpdateTenantBillingScheduleInputSchema = TenantBillingScheduleSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantBillingScheduleInput = z.infer<typeof UpdateTenantBillingScheduleInputSchema>

