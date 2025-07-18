// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { studentPaymentDB } from '../db/studentPayment.repository'
import {
	CreateStudentPaymentPayload,
	DueItemStatusSchema,
	PaymentMethod,
	UpdateStudentPaymentInput,
} from '@/lib/zod'
import {
	DueItemUpdate,
	ProcessPaymentRequest,
	StudentPaymentCreate,
	TransactionCreate,
} from '../types/payment'
import { paymentTransactionDB } from '../../payment-transaction/db/studentPayment.repository'
import Decimal from 'decimal.js'
import { dueItemDB } from '../../dueItem/db/duitem.repository'
import { tenantAccountDB } from '../../tenantAccount/db/tenantAccount.repository'
import { transactionDB } from '../../transactions/db/transaction.repository'
import { prisma } from '@/lib/db'

// export async function processPaymentService({
// 	data,
// }: {
// 	data: ProcessPaymentRequest[]
// }) {
// 	const totalAmount = data.reduce((total, payment) => {
// 		return (
// 			total +
// 			payment.dueItems.reduce((itemTotal, item) => {
// 				return itemTotal + item.collectAmount
// 			}, 0)
// 		)
// 	}, 0)

// 	const transactionData = {
// 		tenantId: data[0].tenantId,
// 		studentId: data[0].studentId,
// 		totalAmount: new Decimal(totalAmount),
// 		collectedBy: data[0].collectedBy,
// 	}

// 	// create transaction (receipt)
// 	const transaction = await paymentTransactionDB.create(transactionData)
// 	const allPayments: any[] = []

// 	for (const payment of data) {
// 		for (const item of payment.dueItems) {
// 			const dueItem = await dueItemDB.getDueItemById(item.dueItemId)
// 			if (!dueItem) throw new Error(`Due item not found: ${item.dueItemId}`)

// 			const newPaidAmount = new Decimal(dueItem.paidAmount).plus(
// 				item.collectAmount,
// 			)
// 			const fullyPaid = newPaidAmount.greaterThanOrEqualTo(dueItem.finalAmount)

// 			// Update due item
// 			await dueItemDB.update(dueItem.id, {
// 				paidAmount: newPaidAmount,
// 				status: fullyPaid
// 					? DueItemStatusSchema.enum.PAID
// 					: DueItemStatusSchema.enum.PARTIAL,
// 			})

// 			const account = await tenantAccountDB.getTenantAccountById(item.accountId)
// 			if (!account) throw new Error(`Account not found: ${item.accountId}`)

// 			await tenantAccountDB.incrementBalance(
// 				account.id,
// 				new Decimal(item.collectAmount),
// 			)

// 			await transactionDB.create({
// 				tenantId: payment.tenantId,
// 				type: 'INCOME',
// 				amount: new Decimal(item.collectAmount),
// 				label: 'Student Payment',
// 				note: payment.reason,
// 				transactionBy: transactionData.collectedBy,
// 				accountId: account.id,
// 			})

// 			// Collect payment record
// 			allPayments.push({
// 				amount: item.collectAmount,
// 				method: account.type,
// 				reason: payment.reason,
// 				month: payment.month,
// 				year: payment.year,
// 				tenantId: payment.tenantId,
// 				dueItemId: item.dueItemId,
// 				paymentTransactionId: transaction.id,
// 			})
// 		}
// 	}
// 	// Insert all student payments
// 	const result = await studentPaymentDB.createMany(allPayments)
// 	// Cache invalidation through injected service
// 	await nextjsCacheService.invalidate([
// 		CACHE_KEYS.STUDENT_PAYMENTS.TAG(data[0].tenantId),
// 		CACHE_KEYS.FEE_ITEMS.TAG(data[0].tenantId),
// 		CACHE_KEYS.DUE_ITEMS.TAG(data[0].tenantId),
// 		CACHE_KEYS.TENANT_ACCOUNTS.TAG(data[0].tenantId),
// 		CACHE_KEYS.STUDENTS.TAG(data[0].studentId),
// 		CACHE_KEYS.TRANSACTIONS.TAG(data[0].tenantId),
// 		CACHE_KEYS.STUDENT_DUES.TAG(data[0].tenantId),
// 	])

// 	return result
// }

export async function processPaymentService({
	data,
}: {
	data: ProcessPaymentRequest[]
}) {
	// Validate input data
	if (!data || data.length === 0) {
		throw new Error('No payment data provided')
	}

	// Extract common data and validate consistency
	const { tenantId, studentId, collectedBy } = data[0]

	// Validate all payments are for the same tenant and student
	const isConsistent = data.every(
		payment =>
			payment.tenantId === tenantId &&
			payment.studentId === studentId &&
			payment.collectedBy === collectedBy,
	)

	if (!isConsistent) {
		throw new Error(
			'All payments must be for the same tenant, student, and collector',
		)
	}

	// Calculate total amount more efficiently
	const totalAmount = data.reduce(
		(total, payment) =>
			total +
			payment.dueItems.reduce(
				(itemTotal, item) => itemTotal + item.collectAmount,
				0,
			),
		0,
	)

	// Start database transaction for atomicity
	return await prisma
		.$transaction(
			async tx => {
				// Create payment transaction (receipt)
				const transaction = await paymentTransactionDB.create(
					{
						tenantId,
						studentId,
						totalAmount: new Decimal(totalAmount),
						collectedBy,
					},
					tx,
				)

				// Collect all IDs that need to be fetched
				const dueItemIds = data.flatMap(payment =>
					payment.dueItems.map(item => item.dueItemId),
				)
				const accountIds = [
					...new Set(
						data.flatMap(payment =>
							payment.dueItems.map(item => item.accountId),
						),
					),
				]

				// Batch fetch all due items and accounts
				const [dueItems, accounts] = await Promise.all([
					dueItemDB.getDueItemsByIds(dueItemIds, tx),
					tenantAccountDB.getTenantAccountsByIds(accountIds, tx),
				])

				// Create lookup maps for faster access
				const dueItemMap = new Map(dueItems.map(item => [item.id, item]))
				const accountMap = new Map(
					accounts.map(account => [account.id, account]),
				)

				// Prepare batch operations
				const dueItemUpdates: DueItemUpdate[] = []
				const accountUpdates = new Map<string, Decimal>() // accountId -> total increment
				const transactionCreates: TransactionCreate[] = []
				const studentPayments: StudentPaymentCreate[] = []

				// Process all payments and prepare batch operations
				for (const payment of data) {
					for (const item of payment.dueItems) {
						const dueItem = dueItemMap.get(item.dueItemId)
						if (!dueItem) {
							throw new Error(`Due item not found: ${item.dueItemId}`)
						}

						const account = accountMap.get(item.accountId)
						if (!account) {
							throw new Error(`Account not found: ${item.accountId}`)
						}

						// Calculate new paid amount and status
						const newPaidAmount = new Decimal(dueItem.paidAmount).plus(
							item.collectAmount,
						)
						const fullyPaid = newPaidAmount.greaterThanOrEqualTo(
							dueItem.finalAmount,
						)

						// Prepare due item update
						dueItemUpdates.push({
							id: dueItem.id,
							paidAmount: newPaidAmount,
							status: fullyPaid
								? DueItemStatusSchema.enum.PAID
								: DueItemStatusSchema.enum.PARTIAL,
						})

						// Accumulate account balance updates
						const currentIncrement =
							accountUpdates.get(account.id) || new Decimal(0)
						accountUpdates.set(
							account.id,
							currentIncrement.plus(item.collectAmount),
						)

						// Prepare transaction creation
						transactionCreates.push({
							tenantId: payment.tenantId,
							type: 'INCOME',
							amount: new Decimal(item.collectAmount),
							label: 'Student Payment',
							note: payment.reason || 'Fee Collection',
							transactionBy: collectedBy,
							categoryId: item.categoryId,
							accountId: account.id,
						})

						// Prepare student payment record
						studentPayments.push({
							amount: new Decimal(item.collectAmount),
							method: account.type,
							reason: payment.reason || 'Fee Collection',
							month: payment.month,
							year: payment.year,
							tenantId: payment.tenantId,
							dueItemId: item.dueItemId,
							paymentTransactionId: transaction.id,
						})
					}
				}

				// Execute all batch operations
				const [updatedDueItems, , createdTransactions, createdPayments] =
					await Promise.all([
						// Batch update due items
						Promise.all(
							dueItemUpdates.map(update =>
								dueItemDB.update(
									update.id,
									{
										paidAmount: update.paidAmount,
										status: update.status,
									},
									tx,
								),
							),
						),

						// Batch update account balances
						Promise.all(
							Array.from(accountUpdates.entries()).map(
								([accountId, increment]) =>
									tenantAccountDB.incrementBalance(accountId, increment, tx),
							),
						),

						// Batch create transactions
						transactionDB.createMany(transactionCreates, tx),

						// Batch create student payments
						studentPaymentDB.createMany(studentPayments, tx),
					])

				// Return summary
				return {
					transaction,
					updatedDueItems: updatedDueItems.length,
					createdTransactions: createdTransactions.length,
					createdPayments: createdPayments.length,
					totalAmount: new Decimal(totalAmount),
				}
			},
			{
				// Transaction options for better error handling
				maxWait: 10000, // 10 seconds
				timeout: 30000, // 30 seconds
			},
		)
		.then(async result => {
			// Cache invalidation after successful transaction
			await nextjsCacheService.invalidate([
				CACHE_KEYS.STUDENT_PAYMENTS.TAG(tenantId),
				CACHE_KEYS.PAYMENT_TRANSACTIONS.TAG(tenantId),
				CACHE_KEYS.DUE_ITEMS.TAG(tenantId),
				CACHE_KEYS.TENANT_ACCOUNTS.TAG(tenantId),
				CACHE_KEYS.STUDENTS.TAG(studentId),
				CACHE_KEYS.TRANSACTIONS.TAG(tenantId),
				CACHE_KEYS.STUDENT_DUES.TAG(tenantId),
				CACHE_KEYS.TENANT_DASHBOARD.TAG(tenantId),
			])

			return result
		})
		.catch(error => {
			// Enhanced error logging
			console.error('Payment processing failed:', {
				error: error.message,
				tenantId,
				studentId,
				totalAmount,
				itemCount: data.reduce(
					(count, payment) => count + payment.dueItems.length,
					0,
				),
			})

			// Re-throw with more context
			throw new Error(`Payment processing failed: ${error.message}`)
		})
}

export async function createStudentPaymentService({
	data,
}: {
	data: CreateStudentPaymentPayload[]
}) {
	// update due item amounts and status
	// create payment
	// create transaction (receipt)
	const result = await studentPaymentDB.createMany(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(data[0].tenantId),
	])

	return result
}

export async function createManyStudentPaymentService({
	data,
}: {
	data: CreateStudentPaymentPayload[]
}) {
	// update due item amounts and status
	// create transaction (receipt)
	// create payment
	const result = await studentPaymentDB.createMany(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(data[0].tenantId),
	])

	return result
}

export async function getAllStudentPaymentsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => studentPaymentDB.getAllStudentPayments(tenantId),
		{
			key: CACHE_KEYS.STUDENT_PAYMENTS.KEY(tenantId),
			tags: [CACHE_KEYS.STUDENT_PAYMENTS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getStudentPaymentByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => studentPaymentDB.getStudentPaymentById(id),
		{
			key: CACHE_KEYS.STUDENT_PAYMENT.KEY(id),
			tags: [CACHE_KEYS.STUDENT_PAYMENT.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateStudentPaymentService({
	id,
	data,
}: {
	id: string
	data: UpdateStudentPaymentInput
}) {
	const existing = await studentPaymentDB.getStudentPaymentById(id)
	if (!existing) {
		throw new Error('Student Payment not found')
	}

	const result = await studentPaymentDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_PAYMENT.TAG(id),
	])

	return result
}

export async function deleteStudentPaymentService({ id }: { id: string }) {
	const existing = await studentPaymentDB.getStudentPaymentById(id)
	if (!existing) {
		throw new Error('Student Payment not found')
	}

	await studentPaymentDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_PAYMENTS.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_PAYMENT.TAG(id),
	])
}
