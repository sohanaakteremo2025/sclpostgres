import { prisma } from '@/lib/db'
import {
	CreateAcademicSessionPayload,
	UpdateAcademicSessionInput,
} from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateAcademicSessionPayload) {
	return await prisma.academicSession.create({ data })
}

async function update(id: string, data: UpdateAcademicSessionInput) {
	return await prisma.academicSession.update({ where: { id }, data })
}

async function deleteSession(id: string) {
	return await prisma.academicSession.delete({ where: { id } })
}

async function getAllSessions(tenantId: string) {
	return await prisma.academicSession.findMany({
		where: { tenantId },
	})
}

async function getSessionById(id: string) {
	return await prisma.academicSession.findUnique({ where: { id } })
}

export const sessionDB = {
	create,
	update,
	delete: deleteSession,
	getAllSessions,
	getSessionById,
}
