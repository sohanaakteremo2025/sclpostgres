import { z } from 'zod'
import { DecimalSchema } from './schemas'
import { PaymentMethodSchema } from './schemas'

export const TenantBillingSchema = z.object({
  id: z.string(),
  method: PaymentMethodSchema,
  amount: DecimalSchema,
  trxId: z.string(),
  reason: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type TenantBilling = z.infer<typeof TenantBillingSchema>

export const CreateTenantBillingInputSchema = TenantBillingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTenantBillingInput = z.infer<typeof CreateTenantBillingInputSchema>

export const CreateTenantBillingPayloadSchema = CreateTenantBillingInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTenantBillingPayload = z.infer<typeof CreateTenantBillingPayloadSchema>

export const UpdateTenantBillingInputSchema = TenantBillingSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantBillingInput = z.infer<typeof UpdateTenantBillingInputSchema>

