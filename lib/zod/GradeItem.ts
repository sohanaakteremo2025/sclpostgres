import { z } from 'zod'

export const GradeItemSchema = z.object({
  id: z.string(),
  gradingScaleId: z.string(),
  minPercentage: z.number(),
  maxPercentage: z.number(),
  grade: z.string(),
  gradePoint: z.number().optional(),
})

export type GradeItem = z.infer<typeof GradeItemSchema>

export const CreateGradeItemInputSchema = GradeItemSchema.omit({
  id: true,
})

export type CreateGradeItemInput = z.infer<typeof CreateGradeItemInputSchema>

export const CreateGradeItemPayloadSchema = CreateGradeItemInputSchema

export type CreateGradeItemPayload = CreateGradeItemInput

export const UpdateGradeItemInputSchema = GradeItemSchema

export type UpdateGradeItemInput = z.infer<typeof UpdateGradeItemInputSchema>

