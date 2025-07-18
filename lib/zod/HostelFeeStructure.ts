import { z } from 'zod'

export const HostelFeeStructureSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type HostelFeeStructure = z.infer<typeof HostelFeeStructureSchema>

export const CreateHostelFeeStructureInputSchema = HostelFeeStructureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateHostelFeeStructureInput = z.infer<typeof CreateHostelFeeStructureInputSchema>

export const CreateHostelFeeStructurePayloadSchema = CreateHostelFeeStructureInputSchema.extend({
  tenantId: z.string(),
})

export type CreateHostelFeeStructurePayload = z.infer<typeof CreateHostelFeeStructurePayloadSchema>

export const UpdateHostelFeeStructureInputSchema = HostelFeeStructureSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateHostelFeeStructureInput = z.infer<typeof UpdateHostelFeeStructureInputSchema>

