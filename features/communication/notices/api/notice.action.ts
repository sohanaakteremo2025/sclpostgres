'use server'

import {
	CreateNoticeInput,
	CreateNoticePayload,
	UpdateNoticeInput,
} from '@/lib/zod'
import {
	createNoticeService,
	getAllNoticesService,
	getNoticeByIdService,
	updateNoticeService,
	deleteNoticeService,
} from '../services/notice.service'

import { getTenantId } from '@/lib/tenant'

export async function createNotice(data: CreateNoticeInput) {
	const tenantId = await getTenantId()

	return await createNoticeService({ data: { ...data, tenantId } })
}

export async function getAllNotices() {
	const tenantId = await getTenantId()

	return await getAllNoticesService({
		tenantId,
	})
}

export async function getNoticeById(id: string) {
	return await getNoticeByIdService({
		id,
	})
}

export async function updateNotice(id: string, data: UpdateNoticeInput) {
	return await updateNoticeService({
		id,
		data,
	})
}

export async function deleteNotice(id: string) {
	return await deleteNoticeService({
		id,
	})
}
