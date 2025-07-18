// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateExamPayload, UpdateExamInput } from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateExamPayload) {
	return await prisma.exam.create({ data })
}

async function update(id: string, data: UpdateExamInput) {
	return await prisma.exam.update({ where: { id }, data })
}

async function deleteExam(id: string) {
	return await prisma.exam.delete({ where: { id } })
}

async function getAllExams(tenantId: string) {
	return await prisma.exam.findMany({
		where: { tenantId },
	})
}

async function getExamById(id: string) {
	return await prisma.exam.findUnique({ where: { id } })
}

export const examDB = {
	create,
	update,
	delete: deleteExam,
	getAllExams,
	getExamById,
}
