import { z } from 'zod'

export const ResultAuditLogSchema = z.object({
  id: z.string(),
  oldMarks: z.number().int(),
  newMarks: z.number().int(),
  updatedById: z.string(),
  updatedAt: z.date(),
  tenantId: z.string(),
  examComponentResultId: z.string(),
})

export type ResultAuditLog = z.infer<typeof ResultAuditLogSchema>

export const CreateResultAuditLogInputSchema = ResultAuditLogSchema.omit({
  id: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateResultAuditLogInput = z.infer<typeof CreateResultAuditLogInputSchema>

export const CreateResultAuditLogPayloadSchema = CreateResultAuditLogInputSchema.extend({
  tenantId: z.string(),
})

export type CreateResultAuditLogPayload = z.infer<typeof CreateResultAuditLogPayloadSchema>

export const UpdateResultAuditLogInputSchema = ResultAuditLogSchema.omit({
  updatedAt: true,
})

export type UpdateResultAuditLogInput = z.infer<typeof UpdateResultAuditLogInputSchema>

