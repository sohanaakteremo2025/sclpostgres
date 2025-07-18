import { z } from 'zod'
import { GenderSchema, ReligionSchema, StudentStatusSchema } from './schemas'

export const StudentSchema = z.object({
  id: z.string(),
  photo: z.string().optional(),
  name: z.string(),
  roll: z.string(),
  email: z.string(),
  phone: z.string(),
  dateOfBirth: z.date(),
  gender: GenderSchema,
  address: z.string(),
  religion: ReligionSchema,
  admissionDate: z.date().optional(),
  studentId: z.string(),
  fatherName: z.string(),
  motherName: z.string(),
  guardianPhone: z.string(),
  status: StudentStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  sessionId: z.string(),
  feeStructureId: z.string().optional(),
  sectionId: z.string(),
  classId: z.string(),
  tenantId: z.string(),
})

export type Student = z.infer<typeof StudentSchema>

export const CreateStudentInputSchema = StudentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateStudentInput = z.infer<typeof CreateStudentInputSchema>

export const CreateStudentPayloadSchema = CreateStudentInputSchema.extend({
  tenantId: z.string(),
})

export type CreateStudentPayload = z.infer<typeof CreateStudentPayloadSchema>

export const UpdateStudentInputSchema = StudentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateStudentInput = z.infer<typeof UpdateStudentInputSchema>

