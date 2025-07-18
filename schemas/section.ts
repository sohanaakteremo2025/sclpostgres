import { SectionSchema } from '@/schema/section'
import { createFormSchemas } from '@/lib/zod-schema-utils'
import { z } from 'zod'

export const sectionSchemas = createFormSchemas(SectionSchema, {
	requiredFields: ['name'],
	createExclude: ['id', 'createdAt', 'updatedAt'],
	updateExclude: ['id', 'createdAt', 'updatedAt'],
})

export const createSectionSchema = sectionSchemas.createSchema
export const updateSectionSchema = sectionSchemas.updateSchema

export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
