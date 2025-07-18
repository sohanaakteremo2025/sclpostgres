// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { studentInvoiceDB } from '../db/studentInvoice.repository'
import {
	CreateStudentInvoicePayload,
	UpdateStudentInvoiceInput,
} from '@/lib/zod'

export async function createStudentInvoiceService({
	data,
}: {
	data: CreateStudentInvoicePayload
}) {
	const result = await studentInvoiceDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_INVOICES.TAG(data.tenantId),
	])

	return result
}

export async function getAllStudentInvoicesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => studentInvoiceDB.getAllStudentInvoices(tenantId),
		{
			key: CACHE_KEYS.STUDENT_INVOICE.KEY(tenantId),
			tags: [CACHE_KEYS.STUDENT_INVOICE.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getStudentInvoiceByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => studentInvoiceDB.getStudentInvoiceById(id),
		{
			key: CACHE_KEYS.STUDENT_INVOICE.KEY(id),
			tags: [CACHE_KEYS.STUDENT_INVOICE.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateStudentInvoiceService({
	id,
	data,
}: {
	id: string
	data: UpdateStudentInvoiceInput
}) {
	const existing = await studentInvoiceDB.getStudentInvoiceById(id)
	if (!existing) {
		throw new Error('Student Invoice not found')
	}

	const result = await studentInvoiceDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_INVOICES.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_INVOICE.TAG(id),
	])

	return result
}

export async function deleteStudentInvoiceService({ id }: { id: string }) {
	const existing = await studentInvoiceDB.getStudentInvoiceById(id)
	if (!existing) {
		throw new Error('Student Invoice not found')
	}

	await studentInvoiceDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_INVOICES.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_INVOICE.TAG(id),
	])
}
