import { z } from 'zod'

export const ResultPublishSchema = z.object({
  id: z.string(),
  publishedAt: z.date().optional(),
  publishedBy: z.string().optional(),
  tenantId: z.string(),
  examScheduleId: z.string(),
  isPublished: z.boolean(),
})

export type ResultPublish = z.infer<typeof ResultPublishSchema>

export const CreateResultPublishInputSchema = ResultPublishSchema.omit({
  id: true,
  tenantId: true,
})

export type CreateResultPublishInput = z.infer<typeof CreateResultPublishInputSchema>

export const CreateResultPublishPayloadSchema = CreateResultPublishInputSchema.extend({
  tenantId: z.string(),
})

export type CreateResultPublishPayload = z.infer<typeof CreateResultPublishPayloadSchema>

export const UpdateResultPublishInputSchema = ResultPublishSchema

export type UpdateResultPublishInput = z.infer<typeof UpdateResultPublishInputSchema>

