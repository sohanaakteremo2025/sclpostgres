// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { paymentTransactionDB } from '../db/studentPayment.repository'
import {
	CreatePaymentTransactionPayload,
	UpdatePaymentTransactionInput,
} from '@/lib/zod'

export async function createPaymentTransactionService({
	data,
}: {
	data: CreatePaymentTransactionPayload
}) {
	// create transaction (receipt)
	const result = await paymentTransactionDB.create(data)
	// create payments
	// update due item amounts and status

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(data.tenantId),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(data.tenantId),
	])

	return result
}

export async function createManyPaymentTransactionService({
	data,
}: {
	data: CreatePaymentTransactionPayload[]
}) {
	const result = await paymentTransactionDB.createMany(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(data[0].tenantId),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(data[0].tenantId),
	])

	return result
}

export async function getAllPaymentTransactionsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => paymentTransactionDB.getAllPaymentTransactions(tenantId),
		{
			key: CACHE_KEYS.STUDENT_PAYMENTS.KEY(tenantId),
			tags: [CACHE_KEYS.STUDENT_PAYMENTS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getPaymentTransactionByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => paymentTransactionDB.getPaymentTransactionById(id),
		{
			key: CACHE_KEYS.STUDENT_PAYMENT.KEY(id),
			tags: [CACHE_KEYS.STUDENT_PAYMENT.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updatePaymentTransactionService({
	id,
	data,
}: {
	id: string
	data: UpdatePaymentTransactionInput
}) {
	const existing = await paymentTransactionDB.getPaymentTransactionById(id)
	if (!existing) {
		throw new Error('Payment Transaction not found')
	}

	const result = await paymentTransactionDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_PAYMENT.TAG(id),
	])

	return result
}

export async function deletePaymentTransactionService({ id }: { id: string }) {
	const existing = await paymentTransactionDB.getPaymentTransactionById(id)
	if (!existing) {
		throw new Error('Payment Transaction not found')
	}

	await paymentTransactionDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_PAYMENT.TAG(id),
	])
}

export async function getPaymentTransactionByStudentIdService({
	studentId,
}: {
	studentId: string
}) {
	return await paymentTransactionDB.getPaymentTransactionByStudentId(studentId)
}

export async function incrementPrintCountService({ id }: { id: string }) {
	const result = await paymentTransactionDB.incrementPrintCount(id)
	await nextjsCacheService.invalidate([
		CACHE_KEYS.PAYMENT_TRANSACTIONS.TAG(result.tenantId),
		CACHE_KEYS.PAYMENT_TRANSACTIONS.TAG(id),
	])
	return result
}
