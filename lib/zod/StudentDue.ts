import { z } from 'zod'

export const StudentDueSchema = z.object({
  id: z.string(),
  month: z.number().int(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  studentId: z.string(),
})

export type StudentDue = z.infer<typeof StudentDueSchema>

export const CreateStudentDueInputSchema = StudentDueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateStudentDueInput = z.infer<typeof CreateStudentDueInputSchema>

export const CreateStudentDuePayloadSchema = CreateStudentDueInputSchema.extend({
  tenantId: z.string(),
})

export type CreateStudentDuePayload = z.infer<typeof CreateStudentDuePayloadSchema>

export const UpdateStudentDueInputSchema = StudentDueSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateStudentDueInput = z.infer<typeof UpdateStudentDueInputSchema>

