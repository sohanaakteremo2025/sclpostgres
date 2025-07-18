import { z } from 'zod'

export const ShiftSchema = z.object({
  id: z.string(),
  title: z.string(),
  startTime: z.number().int(),
  endTime: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type Shift = z.infer<typeof ShiftSchema>

export const CreateShiftInputSchema = ShiftSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateShiftInput = z.infer<typeof CreateShiftInputSchema>

export const CreateShiftPayloadSchema = CreateShiftInputSchema.extend({
  tenantId: z.string(),
})

export type CreateShiftPayload = z.infer<typeof CreateShiftPayloadSchema>

export const UpdateShiftInputSchema = ShiftSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateShiftInput = z.infer<typeof UpdateShiftInputSchema>

