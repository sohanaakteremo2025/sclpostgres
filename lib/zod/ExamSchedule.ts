import { z } from 'zod'

export const ExamScheduleSchema = z.object({
  id: z.string(),
  date: z.date(),
  startTime: z.number().int(),
  endTime: z.number().int(),
  room: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  examId: z.string(),
  classId: z.string(),
  sectionId: z.string().optional(),
  subjectId: z.string(),
  tenantId: z.string(),
})

export type ExamSchedule = z.infer<typeof ExamScheduleSchema>

export const CreateExamScheduleInputSchema = ExamScheduleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateExamScheduleInput = z.infer<typeof CreateExamScheduleInputSchema>

export const CreateExamSchedulePayloadSchema = CreateExamScheduleInputSchema.extend({
  tenantId: z.string(),
})

export type CreateExamSchedulePayload = z.infer<typeof CreateExamSchedulePayloadSchema>

export const UpdateExamScheduleInputSchema = ExamScheduleSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateExamScheduleInput = z.infer<typeof UpdateExamScheduleInputSchema>

