import { z } from 'zod'
import { WeekDaySchema } from './schemas'

export const ClassRoutineSchema = z.object({
  id: z.string(),
  dayOfWeek: WeekDaySchema,
  startTime: z.number().int(),
  endTime: z.number().int(),
  room: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  classId: z.string(),
  sectionId: z.string().optional(),
  subjectId: z.string(),
  teacherId: z.string().optional(),
})

export type ClassRoutine = z.infer<typeof ClassRoutineSchema>

export const CreateClassRoutineInputSchema = ClassRoutineSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateClassRoutineInput = z.infer<typeof CreateClassRoutineInputSchema>

export const CreateClassRoutinePayloadSchema = CreateClassRoutineInputSchema.extend({
  tenantId: z.string(),
})

export type CreateClassRoutinePayload = z.infer<typeof CreateClassRoutinePayloadSchema>

export const UpdateClassRoutineInputSchema = ClassRoutineSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateClassRoutineInput = z.infer<typeof UpdateClassRoutineInputSchema>

