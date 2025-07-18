import { z } from 'zod'

export const ExamGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  sessionId: z.string(),
  tenantId: z.string(),
})

export type ExamGroup = z.infer<typeof ExamGroupSchema>

export const CreateExamGroupInputSchema = ExamGroupSchema.omit({
  id: true,
  tenantId: true,
})

export type CreateExamGroupInput = z.infer<typeof CreateExamGroupInputSchema>

export const CreateExamGroupPayloadSchema = CreateExamGroupInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamGroupPayload = z.infer<typeof CreateExamGroupPayloadSchema>

export const UpdateExamGroupInputSchema = ExamGroupSchema

export type UpdateExamGroupInput = z.infer<typeof UpdateExamGroupInputSchema>

