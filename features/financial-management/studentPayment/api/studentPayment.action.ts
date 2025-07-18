'use server'

import {
	CreateStudentPaymentInput,
	CreateStudentPaymentPayload,
	UpdateStudentPaymentInput,
} from '@/lib/zod'
import {
	createStudentPaymentService,
	createManyStudentPaymentService,
	getAllStudentPaymentsService,
	getStudentPaymentByIdService,
	updateStudentPaymentService,
	deleteStudentPaymentService,
	processPaymentService,
} from '../services/studentPayment.service'

import { getTenantId } from '@/lib/tenant'
import { PaymentData } from '../types/payment'
import { auth } from '@/auth'

export async function processPaymentAction(data: PaymentData[]) {
	console.log('Fee Processed Data', JSON.stringify(data))
	const tenantId = await getTenantId()
	const session = await auth()
	const payments = data.map(payment => ({
		...payment,
		tenantId,
		collectedBy: session?.user?.name,
	}))
	return await processPaymentService({ data: payments })
}

export async function createManyStudentPayment(
	data: CreateStudentPaymentInput[],
) {
	const tenantId = await getTenantId()
	const payments = data.map(payment => ({ ...payment, tenantId }))
	return await createManyStudentPaymentService({ data: payments })
}

export async function getAllStudentPayments() {
	const tenantId = await getTenantId()

	return await getAllStudentPaymentsService({
		tenantId,
	})
}

export async function getStudentPaymentById(id: string) {
	return await getStudentPaymentByIdService({
		id,
	})
}

export async function updateStudentPayment(
	id: string,
	data: UpdateStudentPaymentInput,
) {
	return await updateStudentPaymentService({
		id,
		data,
	})
}

export async function deleteStudentPayment(id: string) {
	return await deleteStudentPaymentService({
		id,
	})
}
