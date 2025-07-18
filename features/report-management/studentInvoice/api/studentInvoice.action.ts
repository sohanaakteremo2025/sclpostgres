'use server'

import {
	CreateStudentInvoicePayload,
	UpdateStudentInvoiceInput,
} from '@/lib/zod'
import {
	createStudentInvoiceService,
	getAllStudentInvoicesService,
	getStudentInvoiceByIdService,
	updateStudentInvoiceService,
	deleteStudentInvoiceService,
} from '../services/studentInvoice.service'

import { getTenantId } from '@/lib/tenant'

export async function createStudentInvoice(data: CreateStudentInvoicePayload) {
	const tenantId = await getTenantId()

	return await createStudentInvoiceService({ data: { ...data, tenantId } })
}

export async function getAllStudentInvoices() {
	const tenantId = await getTenantId()

	return await getAllStudentInvoicesService({
		tenantId,
	})
}

export async function getStudentInvoiceById(id: string) {
	return await getStudentInvoiceByIdService({
		id,
	})
}

export async function updateStudentInvoice(
	id: string,
	data: UpdateStudentInvoiceInput,
) {
	return await updateStudentInvoiceService({
		id,
		data,
	})
}

export async function deleteStudentInvoice(id: string) {
	return await deleteStudentInvoiceService({
		id,
	})
}
