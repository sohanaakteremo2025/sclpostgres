import { z } from 'zod'
import { SubjectTypeSchema } from './schemas'

export const SubjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  type: SubjectTypeSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  classId: z.string(),
  sectionId: z.string().optional(),
})

export type Subject = z.infer<typeof SubjectSchema>

export const CreateSubjectInputSchema = SubjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateSubjectInput = z.infer<typeof CreateSubjectInputSchema>

export const CreateSubjectPayloadSchema = CreateSubjectInputSchema.extend({
  tenantId: z.string(),
})

export type CreateSubjectPayload = z.infer<typeof CreateSubjectPayloadSchema>

export const UpdateSubjectInputSchema = SubjectSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateSubjectInput = z.infer<typeof UpdateSubjectInputSchema>

