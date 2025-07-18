// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateExamTypePayload, UpdateExamTypeInput } from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateExamTypePayload) {
	return await prisma.examType.create({ data })
}

async function update(id: string, data: UpdateExamTypeInput) {
	return await prisma.examType.update({ where: { id }, data })
}

async function deleteExamType(id: string) {
	return await prisma.examType.delete({ where: { id } })
}

async function getAllExamTypes(tenantId: string) {
	return await prisma.examType.findMany({
		where: { tenantId },
	})
}

async function getExamTypeById(id: string) {
	return await prisma.examType.findUnique({ where: { id } })
}

export const examTypeDB = {
	create,
	update,
	delete: deleteExamType,
	getAllExamTypes,
	getExamTypeById,
}
