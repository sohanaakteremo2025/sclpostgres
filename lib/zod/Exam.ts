import { z } from 'zod'
import { ExamStatusSchema } from './schemas'

export const ExamSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  status: ExamStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  examTypeId: z.string(),
  sessionId: z.string(),
  tenantId: z.string(),
})

export type Exam = z.infer<typeof ExamSchema>

export const CreateExamInputSchema = ExamSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateExamInput = z.infer<typeof CreateExamInputSchema>

export const CreateExamPayloadSchema = CreateExamInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamPayload = z.infer<typeof CreateExamPayloadSchema>

export const UpdateExamInputSchema = ExamSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateExamInput = z.infer<typeof UpdateExamInputSchema>

