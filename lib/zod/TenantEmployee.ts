import { z } from 'zod'
import { ReligionSchema, GenderSchema, EmployeeStatusSchema, EmployeeRoleSchema } from './schemas'

export const TenantEmployeeSchema = z.object({
  id: z.string(),
  photo: z.string().optional(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  religion: ReligionSchema,
  gender: GenderSchema,
  status: EmployeeStatusSchema,
  role: EmployeeRoleSchema,
  dateOfBirth: z.string(),
  address: z.string(),
  designation: z.string(),
  nationalId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type TenantEmployee = z.infer<typeof TenantEmployeeSchema>

export const CreateTenantEmployeeInputSchema = TenantEmployeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTenantEmployeeInput = z.infer<typeof CreateTenantEmployeeInputSchema>

export const CreateTenantEmployeePayloadSchema = CreateTenantEmployeeInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTenantEmployeePayload = z.infer<typeof CreateTenantEmployeePayloadSchema>

export const UpdateTenantEmployeeInputSchema = TenantEmployeeSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantEmployeeInput = z.infer<typeof UpdateTenantEmployeeInputSchema>

