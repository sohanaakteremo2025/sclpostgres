'use server'

import { getSubdomainDB } from '../getSubdomainDB'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth.action'
import { Section } from '@prisma/client'

export const getSectionsByClassId = async (classId: string) => {
	const prisma = await getSubdomainDB()
	try {
		const sections = await prisma.section.findMany({ where: { classId } })
		return JSON.parse(JSON.stringify(sections))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getAllSections = async (): Promise<Section[]> => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId

	const prisma = await getSubdomainDB()
	try {
		const sections = await prisma.section.findMany({
			where: {
				tenantId,
			},
		})
		return JSON.parse(JSON.stringify(sections))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const deleteSection = async (sectionId: string) => {
	const prisma = await getSubdomainDB()
	try {
		const section = await prisma.section.delete({ where: { id: sectionId } })
		revalidatePath('/dashboard/admin/classes')
		return JSON.parse(JSON.stringify(section))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
