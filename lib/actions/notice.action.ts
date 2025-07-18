'use server'

import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Notice } from '@prisma/client'

export async function createNotice(data: any) {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId

	const prisma = await getSubdomainDB()

	const notice = await prisma.notice.create({
		data: {
			...data,
			date: format(new Date(data.date), 'dd-MM-yyyy'),
			tenantId,
		},
	})
	revalidatePath('/dashboard/admin/notices')
	return JSON.parse(JSON.stringify(notice))
}

export async function updateNotice(id: string, data: any) {
	const prisma = await getSubdomainDB()

	const notice = await prisma.notice.update({
		where: {
			id,
		},
		data,
	})
	revalidatePath('/dashboard/admin/notices')
	return JSON.parse(JSON.stringify(notice))
}

export async function getAllNotices(): Promise<Notice[]> {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	// get last 10
	const notices = await prisma.notice.findMany({
		where: {
			tenantId,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
	return JSON.parse(JSON.stringify(notices))
}

//get all notices by tenantId first 10
export async function getAllNoticesByTenantId(tenantId: string) {
	const prisma = await getSubdomainDB()
	const notices = await prisma.notice.findMany({
		where: {
			tenantId,
		},
		orderBy: {
			createdAt: 'desc',
		},
		take: 10,
	})
	return JSON.parse(JSON.stringify(notices))
}

export async function deleteNotice(id: string) {
	const prisma = await getSubdomainDB()
	const notice = await prisma.notice.delete({
		where: {
			id,
		},
	})
	revalidatePath('/dashboard/admin/notices')
	return JSON.parse(JSON.stringify(notice))
}
