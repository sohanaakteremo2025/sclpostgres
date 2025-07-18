import { z } from 'zod'

export const ExamComponentResultSchema = z.object({
  id: z.string(),
  obtainedMarks: z.number().int(),
  isAbsent: z.boolean(),
  remarks: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  examComponentId: z.string(),
  studentId: z.string(),
  examResultId: z.string(),
  tenantId: z.string(),
})

export type ExamComponentResult = z.infer<typeof ExamComponentResultSchema>

export const CreateExamComponentResultInputSchema = ExamComponentResultSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateExamComponentResultInput = z.infer<typeof CreateExamComponentResultInputSchema>

export const CreateExamComponentResultPayloadSchema = CreateExamComponentResultInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamComponentResultPayload = z.infer<typeof CreateExamComponentResultPayloadSchema>

export const UpdateExamComponentResultInputSchema = ExamComponentResultSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateExamComponentResultInput = z.infer<typeof UpdateExamComponentResultInputSchema>

