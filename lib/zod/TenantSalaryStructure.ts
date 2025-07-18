import { z } from 'zod'

export const TenantSalaryStructureSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type TenantSalaryStructure = z.infer<typeof TenantSalaryStructureSchema>

export const CreateTenantSalaryStructureInputSchema = TenantSalaryStructureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateTenantSalaryStructureInput = z.infer<typeof CreateTenantSalaryStructureInputSchema>

export const CreateTenantSalaryStructurePayloadSchema = CreateTenantSalaryStructureInputSchema.extend({
  tenantId: z.string(),
})

export type CreateTenantSalaryStructurePayload = z.infer<typeof CreateTenantSalaryStructurePayloadSchema>

export const UpdateTenantSalaryStructureInputSchema = TenantSalaryStructureSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateTenantSalaryStructureInput = z.infer<typeof UpdateTenantSalaryStructureInputSchema>

