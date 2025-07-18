// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateExamResultPayload, UpdateExamResultInput } from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateExamResultPayload) {
	return await prisma.examResult.create({ data })
}

async function update(id: string, data: UpdateExamResultInput) {
	return await prisma.examResult.update({ where: { id }, data })
}

async function deleteResult(id: string) {
	return await prisma.examResult.delete({ where: { id } })
}

async function getAllResults(tenantId: string) {
	return await prisma.examResult.findMany({
		where: { tenantId },
	})
}

async function getResultById(id: string) {
	return await prisma.examResult.findUnique({ where: { id } })
}

export const resultDB = {
	create,
	update,
	delete: deleteResult,
	getAllResults,
	getResultById,
}
