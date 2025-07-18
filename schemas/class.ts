import { ClassSchema } from '@/lib/zod'
import { createFormSchemas } from '@/lib/zod-schema-utils'
import { z } from 'zod'

export const classSchemas = createFormSchemas(ClassSchema, {
	requiredFields: ['name'],
	createExclude: ['id', 'createdAt', 'updatedAt', 'tenantId'],
	updateExclude: ['id', 'createdAt', 'updatedAt', 'tenantId'],
})

export const createClassSchema = classSchemas.createSchema
export const updateClassSchema = classSchemas.updateSchema

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
