import { z } from 'zod'

export const ExamComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  maxMarks: z.number().int(),
  order: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  examScheduleId: z.string(),
  tenantId: z.string(),
})

export type ExamComponent = z.infer<typeof ExamComponentSchema>

export const CreateExamComponentInputSchema = ExamComponentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateExamComponentInput = z.infer<typeof CreateExamComponentInputSchema>

export const CreateExamComponentPayloadSchema = CreateExamComponentInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamComponentPayload = z.infer<typeof CreateExamComponentPayloadSchema>

export const UpdateExamComponentInputSchema = ExamComponentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateExamComponentInput = z.infer<typeof UpdateExamComponentInputSchema>

