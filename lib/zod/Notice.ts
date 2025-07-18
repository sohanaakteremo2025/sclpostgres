import { z } from 'zod'

export const NoticeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
})

export type Notice = z.infer<typeof NoticeSchema>

export const CreateNoticeInputSchema = NoticeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateNoticeInput = z.infer<typeof CreateNoticeInputSchema>

export const CreateNoticePayloadSchema = CreateNoticeInputSchema.extend({
  tenantId: z.string(),
})

export type CreateNoticePayload = z.infer<typeof CreateNoticePayloadSchema>

export const UpdateNoticeInputSchema = NoticeSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateNoticeInput = z.infer<typeof UpdateNoticeInputSchema>

