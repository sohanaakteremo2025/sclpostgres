import { z } from 'zod'

export const ExamGroupItemSchema = z.object({
  id: z.string(),
  examId: z.string(),
  studentId: z.string(),
  tenantId: z.string(),
  totalMarks: z.number().int(),
  obtainedMarks: z.number().int(),
  grade: z.string().optional(),
  isPublished: z.boolean(),
  examGroupId: z.string(),
})

export type ExamGroupItem = z.infer<typeof ExamGroupItemSchema>

export const CreateExamGroupItemInputSchema = ExamGroupItemSchema.omit({
  id: true,
  tenantId: true,
})

export type CreateExamGroupItemInput = z.infer<typeof CreateExamGroupItemInputSchema>

export const CreateExamGroupItemPayloadSchema = CreateExamGroupItemInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamGroupItemPayload = z.infer<typeof CreateExamGroupItemPayloadSchema>

export const UpdateExamGroupItemInputSchema = ExamGroupItemSchema

export type UpdateExamGroupItemInput = z.infer<typeof UpdateExamGroupItemInputSchema>

