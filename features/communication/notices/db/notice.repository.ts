// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import { CreateNoticePayload, UpdateNoticeInput } from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateNoticePayload) {
	return await prisma.notice.create({ data })
}

async function update(id: string, data: UpdateNoticeInput) {
	return await prisma.notice.update({ where: { id }, data })
}

async function deleteNotice(id: string) {
	return await prisma.notice.delete({ where: { id } })
}

async function getAllNotices(tenantId: string) {
	return await prisma.notice.findMany({
		where: { tenantId },
	})
}

async function getNoticeById(id: string) {
	return await prisma.notice.findUnique({ where: { id } })
}

export const noticeDB = {
	create,
	update,
	delete: deleteNotice,
	getAllNotices,
	getNoticeById,
}
