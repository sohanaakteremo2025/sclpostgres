import { z } from 'zod'
import { DecimalSchema } from './schemas'

export const TenantSalaryDueSchema = z.object({
  id: z.string(),
  amount: DecimalSchema,
  month: z.number().int(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  employeeId: z.string(),
})

export type TenantSalaryDue = z.infer<typeof TenantSalaryDueSchema>

export const CreateTenantSalaryDueInputSchema = TenantSalaryDueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateTenantSalaryDueInput = z.infer<typeof CreateTenantSalaryDueInputSchema>

export const CreateTenantSalaryDuePayloadSchema = CreateTenantSalaryDueInputSchema

export type CreateTenantSalaryDuePayload = CreateTenantSalaryDueInput

export const UpdateTenantSalaryDueInputSchema = TenantSalaryDueSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantSalaryDueInput = z.infer<typeof UpdateTenantSalaryDueInputSchema>

