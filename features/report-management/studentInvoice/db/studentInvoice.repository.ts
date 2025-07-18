// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateStudentInvoicePayload,
	UpdateStudentInvoiceInput,
} from '@/lib/zod'

// Pure data access - no caching!
async function create(data: CreateStudentInvoicePayload) {
	return await prisma.studentInvoice.create({ data })
}

async function update(id: string, data: UpdateStudentInvoiceInput) {
	return await prisma.studentInvoice.update({ where: { id }, data })
}

async function deleteStudentInvoice(id: string) {
	return await prisma.studentInvoice.delete({ where: { id } })
}

async function getAllStudentInvoices(tenantId: string) {
	return await prisma.studentInvoice.findMany({
		where: { tenantId },
	})
}

async function getStudentInvoiceById(id: string) {
	return await prisma.studentInvoice.findUnique({ where: { id } })
}

export const studentInvoiceDB = {
	create,
	update,
	delete: deleteStudentInvoice,
	getAllStudentInvoices,
	getStudentInvoiceById,
}
