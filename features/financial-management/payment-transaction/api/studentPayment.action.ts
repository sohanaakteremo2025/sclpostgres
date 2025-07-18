'use server'

import {
	CreatePaymentTransactionInput,
	CreateStudentPaymentInput,
	CreateStudentPaymentPayload,
	UpdatePaymentTransactionInput,
	UpdateStudentPaymentInput,
} from '@/lib/zod'
import {
	createPaymentTransactionService,
	createManyPaymentTransactionService,
	getAllPaymentTransactionsService,
	getPaymentTransactionByIdService,
	updatePaymentTransactionService,
	deletePaymentTransactionService,
	getPaymentTransactionByStudentIdService,
	incrementPrintCountService,
} from '../services/studentPayment.service'
import { auth } from '@/auth'
import { getTenantId } from '@/lib/tenant'

export async function createManyPaymentTransaction(data: any) {
	const tenantId = await getTenantId()

	const payments = data.map((payment: any) => ({ ...payment, tenantId }))

	return await createManyPaymentTransactionService({ data: payments })
}

export async function getAllPaymentTransactions() {
	const tenantId = await getTenantId()

	return await getAllPaymentTransactionsService({
		tenantId,
	})
}

export async function getPaymentTransactionById(id: string) {
	return await getPaymentTransactionByIdService({
		id,
	})
}

export async function updatePaymentTransaction(
	id: string,
	data: UpdatePaymentTransactionInput,
) {
	return await updatePaymentTransactionService({
		id,
		data,
	})
}

export async function deletePaymentTransaction(id: string) {
	return await deletePaymentTransactionService({
		id,
	})
}

export async function getPaymentTransactionByStudentId(studentId: string) {
	return await getPaymentTransactionByStudentIdService({
		studentId,
	})
}

export async function incrementPrintCount(id: string) {
	return await incrementPrintCountService({
		id,
	})
}
