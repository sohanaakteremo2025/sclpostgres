import { prisma } from '@/lib/db'
import { CreateStudentInput, UpdateStudentInput } from '@/lib/zod'
import { TransactionClient } from '@/types'
import { getTenantId } from '@/lib/tenant'

async function create(data: CreateStudentInput, tx?: TransactionClient) {
	const client = tx || prisma
	const tenantId = await getTenantId()
	return await client.student.create({ data: { ...data, tenantId } })
}

async function update(id: string, data: UpdateStudentInput) {
	return await prisma.student.update({ where: { id }, data })
}

async function deleteStudent(id: string) {
	return await prisma.student.delete({ where: { id } })
}

async function getAll(tenantId: string) {
	return await prisma.student.findMany({ where: { tenantId } })
}

async function getById(id: string) {
	return await prisma.student.findUnique({ where: { id } })
}

async function getBySectionId(sectionId: string) {
	return await prisma.student.findMany({ where: { sectionId } })
}

async function getByClassId(classId: string) {
	return await prisma.student.findMany({ where: { section: { classId } } })
}

export const studentDB = {
	create,
	update,
	delete: deleteStudent,
	getAll,
	getById,
	getBySectionId,
	getByClassId,
}
