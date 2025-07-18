// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateClassRoutinePayload, UpdateClassRoutineInput } from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateClassRoutinePayload) {
	return await prisma.classRoutine.create({ data })
}

async function update(id: string, data: UpdateClassRoutineInput) {
	return await prisma.classRoutine.update({ where: { id }, data })
}

async function deleteClassRoutine(id: string) {
	return await prisma.classRoutine.delete({ where: { id } })
}

async function getAllClassRoutines(tenantId: string) {
	return await prisma.classRoutine.findMany({
		where: { tenantId },
	})
}

async function getClassRoutineById(id: string) {
	return await prisma.classRoutine.findUnique({ where: { id } })
}

export const classRoutineDB = {
	create,
	update,
	delete: deleteClassRoutine,
	getAllClassRoutines,
	getClassRoutineById,
}
