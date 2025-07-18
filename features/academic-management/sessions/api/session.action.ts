'use server'

import {
	CreateAcademicSessionInput,
	UpdateAcademicSessionInput,
} from '@/lib/zod'
import {
	createSessionService,
	getAllSessionsService,
	getSessionByIdService,
	updateSessionService,
	deleteSessionService,
} from '../services/session.service'

import { getTenantId } from '@/lib/tenant'

export async function createSession(data: CreateAcademicSessionInput) {
	const tenantId = await getTenantId()

	return await createSessionService({ data: { ...data, tenantId } })
}

export async function getAllSessions() {
	const tenantId = await getTenantId()

	return await getAllSessionsService({
		tenantId,
	})
}

export async function getSessionById(id: string) {
	return await getSessionByIdService({
		id,
	})
}

export async function updateSession(
	id: string,
	data: UpdateAcademicSessionInput,
) {
	return await updateSessionService({
		id,
		data,
	})
}

export async function deleteSession(id: string) {
	return await deleteSessionService({
		id,
	})
}
