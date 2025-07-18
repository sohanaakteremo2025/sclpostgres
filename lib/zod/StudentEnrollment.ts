import { z } from 'zod'
import { EnrollmentStatusSchema } from './schemas'

export const StudentEnrollmentSchema = z.object({
  id: z.string(),
  roll: z.string(),
  status: EnrollmentStatusSchema,
  joinDate: z.date(),
  leaveDate: z.date().optional(),
  note: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  promotedFromId: z.string().optional(),
  tenantId: z.string(),
  studentId: z.string(),
  classId: z.string(),
  sectionId: z.string(),
  sessionId: z.string(),
})

export type StudentEnrollment = z.infer<typeof StudentEnrollmentSchema>

export const CreateStudentEnrollmentInputSchema = StudentEnrollmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateStudentEnrollmentInput = z.infer<typeof CreateStudentEnrollmentInputSchema>

export const CreateStudentEnrollmentPayloadSchema = CreateStudentEnrollmentInputSchema.extend({
  tenantId: z.string(),
})

export type CreateStudentEnrollmentPayload = z.infer<typeof CreateStudentEnrollmentPayloadSchema>

export const UpdateStudentEnrollmentInputSchema = StudentEnrollmentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateStudentEnrollmentInput = z.infer<typeof UpdateStudentEnrollmentInputSchema>

