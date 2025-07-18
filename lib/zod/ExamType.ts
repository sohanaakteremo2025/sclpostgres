import { z } from 'zod'

export const ExamTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number(),
  tenantId: z.string(),
})

export type ExamType = z.infer<typeof ExamTypeSchema>

export const CreateExamTypeInputSchema = ExamTypeSchema.omit({
  id: true,
  tenantId: true,
})

export type CreateExamTypeInput = z.infer<typeof CreateExamTypeInputSchema>

export const CreateExamTypePayloadSchema = CreateExamTypeInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamTypePayload = z.infer<typeof CreateExamTypePayloadSchema>

export const UpdateExamTypeInputSchema = ExamTypeSchema

export type UpdateExamTypeInput = z.infer<typeof UpdateExamTypeInputSchema>

