import { z } from 'zod'
import { SessionStatusSchema } from './schemas'

export const AcademicSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  status: SessionStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type AcademicSession = z.infer<typeof AcademicSessionSchema>

export const CreateAcademicSessionInputSchema = AcademicSessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateAcademicSessionInput = z.infer<typeof CreateAcademicSessionInputSchema>

export const CreateAcademicSessionPayloadSchema = CreateAcademicSessionInputSchema.extend({
  tenantId: z.string(),
})

export type CreateAcademicSessionPayload = z.infer<typeof CreateAcademicSessionPayloadSchema>

export const UpdateAcademicSessionInputSchema = AcademicSessionSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateAcademicSessionInput = z.infer<typeof UpdateAcademicSessionInputSchema>

