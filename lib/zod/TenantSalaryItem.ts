import { z } from 'zod'
import { DecimalSchema } from './schemas'

export const TenantSalaryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: DecimalSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  salaryStructureId: z.string(),
})

export type TenantSalaryItem = z.infer<typeof TenantSalaryItemSchema>

export const CreateTenantSalaryItemInputSchema = TenantSalaryItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateTenantSalaryItemInput = z.infer<typeof CreateTenantSalaryItemInputSchema>

export const CreateTenantSalaryItemPayloadSchema = CreateTenantSalaryItemInputSchema

export type CreateTenantSalaryItemPayload = CreateTenantSalaryItemInput

export const UpdateTenantSalaryItemInputSchema = TenantSalaryItemSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantSalaryItemInput = z.infer<typeof UpdateTenantSalaryItemInputSchema>

