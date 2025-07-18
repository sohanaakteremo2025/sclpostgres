//section repository
import { prisma } from '@/lib/db'
import { CreateSectionPayload, UpdateSectionInput } from '@/lib/zod'

const getSectionsByClassId = async (classId: string) => {
	const sections = await prisma.section.findMany({
		where: {
			classId,
		},
	})
	return sections
}

const createSection = async (data: CreateSectionPayload) => {
	return await prisma.section.create({ data })
}

const updateSection = async (id: string, data: UpdateSectionInput) => {
	return await prisma.section.update({ where: { id }, data })
}

const deleteSection = async (id: string) => {
	return await prisma.section.delete({ where: { id } })
}

const findByName = async (name: string) => {
	return await prisma.section.findFirst({
		where: { name },
	})
}

const findByClassIdAndName = async (classId: string, name: string) => {
	return await prisma.section.findFirst({
		where: { classId, name },
	})
}

export const sectionDB = {
	getSectionsByClassId,
	createSection,
	updateSection,
	deleteSection,
	findByName,
	findByClassIdAndName,
}
