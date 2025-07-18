import { z } from 'zod'

export const ExamResultSchema = z.object({
  id: z.string(),
  obtainedMarks: z.number().int(),
  totalMarks: z.number().int(),
  percentage: z.number().optional(),
  grade: z.string().optional(),
  isAbsent: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  examScheduleId: z.string(),
  studentId: z.string(),
  tenantId: z.string(),
})

export type ExamResult = z.infer<typeof ExamResultSchema>

export const CreateExamResultInputSchema = ExamResultSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateExamResultInput = z.infer<typeof CreateExamResultInputSchema>

export const CreateExamResultPayloadSchema = CreateExamResultInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamResultPayload = z.infer<typeof CreateExamResultPayloadSchema>

export const UpdateExamResultInputSchema = ExamResultSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateExamResultInput = z.infer<typeof UpdateExamResultInputSchema>

