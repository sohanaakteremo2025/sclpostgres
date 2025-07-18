import { z } from 'zod'
import { LogLevelSchema } from './schemas'

export const LogSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  action: z.string(),
  message: z.string().optional(),
  level: LogLevelSchema,
  duration: z.number().int().optional(),
  createdAt: z.date(),
})

export type Log = z.infer<typeof LogSchema>

export const CreateLogInputSchema = LogSchema.omit({
  id: true,
  createdAt: true,
})

export type CreateLogInput = z.infer<typeof CreateLogInputSchema>

export const CreateLogPayloadSchema = CreateLogInputSchema

export type CreateLogPayload = CreateLogInput

export const UpdateLogInputSchema = LogSchema.omit({
  createdAt: true,
})

export type UpdateLogInput = z.infer<typeof UpdateLogInputSchema>

