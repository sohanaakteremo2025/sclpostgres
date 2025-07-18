'use server'

import { getTenantId } from '@/lib/tenant'
import {
	createSectionService,
	deleteSectionService,
	getSectionsByClassIdService,
	updateSectionService,
} from '../services/section.service'
import { CreateSectionInput, UpdateSectionInput } from '@/lib/zod'

export const getSectionsByClassId = async (classId: string) => {
	return await getSectionsByClassIdService(classId)
}

export const createSection = async (data: CreateSectionInput) => {
	const tenantId = await getTenantId()
	return await createSectionService({
		...data,
		tenantId,
	})
}

export const updateSection = async (id: string, data: UpdateSectionInput) => {
	const tenantId = await getTenantId()
	return await updateSectionService(id, { ...data, tenantId })
}

export const deleteSection = async (id: string) => {
	const tenantId = await getTenantId()
	return await deleteSectionService({ id, tenantId })
}
