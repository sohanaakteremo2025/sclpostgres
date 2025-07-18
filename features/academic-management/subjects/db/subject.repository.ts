// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateSubjectPayload, UpdateSubjectInput } from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateSubjectPayload) {
	return await prisma.subject.create({ data })
}

async function update(id: string, data: UpdateSubjectInput) {
	return await prisma.subject.update({ where: { id }, data })
}

async function deleteSubject(id: string) {
	return await prisma.subject.delete({ where: { id } })
}

async function getAllSubjects(tenantId: string) {
	return await prisma.subject.findMany({
		where: { tenantId },
	})
}

async function getSubjectById(id: string) {
	return await prisma.subject.findUnique({ where: { id } })
}

async function getSubjectsByClassOrSection(
	classId?: string,
	sectionId?: string,
) {
	return await prisma.subject.findMany({
		where: { classId, OR: [{ sectionId: null }, { sectionId }] },
		orderBy: [
			{ sectionId: 'asc' }, // Class-level subjects (null) first, then section subjects
			{ name: 'asc' }, // Then alphabetical by name
		],
	})
}

async function getSubjectsByClassId(classId?: string) {
	return await prisma.subject.findMany({
		where: { classId },
	})
}

async function getSubjectsBySection(sectionId?: string) {
	return await prisma.subject.findMany({
		where: { sectionId },
	})
}

export const subjectDB = {
	create,
	update,
	delete: deleteSubject,
	getAllSubjects,
	getSubjectById,
	getSubjectsByClassOrSection,
	getSubjectsByClassId,
	getSubjectsBySection,
}
