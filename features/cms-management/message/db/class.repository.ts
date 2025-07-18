// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateClassPayload, UpdateClassInput } from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateClassPayload) {
	return await prisma.class.create({ data })
}

async function update(id: string, data: UpdateClassInput) {
	return await prisma.class.update({ where: { id }, data })
}

async function deleteClass(id: string) {
	return await prisma.class.delete({ where: { id } })
}

async function findByName(name: string, tenantId: string) {
	return await prisma.class.findFirst({
		where: { name, tenantId },
	})
}

async function getAllClasses(tenantId: string) {
	return await prisma.class.findMany({
		where: { tenantId },
		orderBy: { name: 'asc' },
	})
}

async function getClassById(id: string) {
	return await prisma.class.findUnique({ where: { id } })
}

export const classDB = {
	create,
	update,
	delete: deleteClass,
	getAllClasses,
	getClassById,
	findByName,
}
