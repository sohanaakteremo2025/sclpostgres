import { z } from 'zod'
import { AttendanceStatusSchema } from './schemas'

export const StudentAttendanceSchema = z.object({
  id: z.string(),
  date: z.date(),
  status: AttendanceStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  studentId: z.string(),
})

export type StudentAttendance = z.infer<typeof StudentAttendanceSchema>

export const CreateStudentAttendanceInputSchema = StudentAttendanceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateStudentAttendanceInput = z.infer<typeof CreateStudentAttendanceInputSchema>

export const CreateStudentAttendancePayloadSchema = CreateStudentAttendanceInputSchema.extend({
  tenantId: z.string(),
})

export type CreateStudentAttendancePayload = z.infer<typeof CreateStudentAttendancePayloadSchema>

export const UpdateStudentAttendanceInputSchema = StudentAttendanceSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateStudentAttendanceInput = z.infer<typeof UpdateStudentAttendanceInputSchema>

