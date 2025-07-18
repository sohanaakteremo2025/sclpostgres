// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { transactionDB } from '../db/transaction.repository'
import {
	CreateTenantTransactionPayload,
	UpdateTenantTransactionInput,
} from '@/lib/zod'
import { getTenantAccountByIdService } from '@/features/financial-management/tenantAccount/services/tenantAccount.service'
import { tenantAccountDB } from '../../tenantAccount/db/tenantAccount.repository'
import { prisma } from '@/lib/db'
import Decimal from 'decimal.js'

export async function createTransactionService({
	data,
}: {
	data: CreateTenantTransactionPayload
}) {
	// Convert client Decimal to Prisma Decimal
	const amount = new Decimal(data.amount.toString())

	const account = await getTenantAccountByIdService({
		id: data.accountId!,
	})

	if (!account) {
		throw new Error('Account not found')
	}

	if (data.type === 'EXPENSE') {
		// Now we can use Decimal methods
		if (amount.gt(account.balance)) {
			throw new Error(`Not enough balance for expense on: ${account.title}`)
		}
	}

	const tx = await prisma.$transaction(async tx => {
		const result = await transactionDB.create({ ...data, amount }, tx)

		if (data.type === 'EXPENSE') {
			await tenantAccountDB.decrementBalance(data.accountId!, amount, tx)
		}
		if (data.type === 'INCOME') {
			await tenantAccountDB.incrementBalance(data.accountId!, amount, tx)
		}
		return result
	})

	await nextjsCacheService.invalidate([
		CACHE_KEYS.TRANSACTIONS.TAG(data.tenantId),
		CACHE_KEYS.TENANT_ACCOUNTS.TAG(data.tenantId),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(data.tenantId),
	])

	return tx
}

export async function getAllTransactionsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => transactionDB.getAllTransactions(tenantId),
		{
			key: CACHE_KEYS.TRANSACTIONS.KEY(tenantId),
			tags: [CACHE_KEYS.TRANSACTIONS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getTransactionByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => transactionDB.getTransactionById(id),
		{
			key: CACHE_KEYS.TRANSACTION_BY_ID.KEY(id),
			tags: [CACHE_KEYS.TRANSACTION_BY_ID.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateTransactionService({
	id,
	data,
}: {
	id: string
	data: UpdateTenantTransactionInput
}) {
	const existing = await transactionDB.getTransactionById(id)
	if (!existing) {
		throw new Error('Transaction not found')
	}

	const result = await transactionDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TRANSACTIONS.TAG(existing.tenantId),
		CACHE_KEYS.TRANSACTION_BY_ID.TAG(id),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(existing.tenantId),
	])

	return result
}

export async function deleteTransactionService({ id }: { id: string }) {
	const existing = await transactionDB.getTransactionById(id)
	if (!existing) {
		throw new Error('Transaction not found')
	}

	await transactionDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.TRANSACTIONS.TAG(existing.tenantId),
		CACHE_KEYS.TRANSACTION_BY_ID.TAG(id),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(existing.tenantId),
	])
}

export async function deleteManyTransactionService({
	ids,
	tenantId,
}: {
	ids: string[]
	tenantId: string
}) {
	await transactionDB.deleteMany(ids)

	await nextjsCacheService.invalidate([CACHE_KEYS.TRANSACTIONS.TAG(tenantId)])
}
