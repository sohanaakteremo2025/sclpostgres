// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { tenantAccountDB } from '../db/tenantAccount.repository'
import {
	CreateTenantAccountPayload,
	TransactionTypeSchema,
	UpdateTenantAccountInput,
} from '@/lib/zod'
import {
	DepositInput,
	DepositPayloadInput,
	FundTransferInput,
	WithdrawInput,
	WithdrawPayloadInput,
} from '../types'
import Decimal from 'decimal.js'
import { prisma } from '@/lib/db'
import { transactionDB } from '../../transactions/db/transaction.repository'

export async function createTenantAccountService({
	data,
}: {
	data: CreateTenantAccountPayload
}) {
	const result = await tenantAccountDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ACCOUNTS.TAG(data.tenantId),
		CACHE_KEYS.TENANT_DASHBOARD.TAG(data.tenantId),
	])

	return result
}

export async function fundTransferService({
	data,
	transactionBy,
}: {
	data: FundTransferInput
	transactionBy: string
}) {
	const fromAccount = await getTenantAccountByIdService({
		id: data.fromTenantAccount,
	})
	const toAccount = await getTenantAccountByIdService({
		id: data.toTenantAccount,
	})

	const amount = new Decimal(data.amount.toString())
	if (!fromAccount || !toAccount) {
		throw new Error('Account not found')
	}

	if (amount.gt(fromAccount.balance)) {
		throw new Error(`Not enough balance for transfer on: ${fromAccount.title}`)
	}

	const transactionData = {
		amount,
		type: TransactionTypeSchema.Enum.FUND_TRANSFER,
		tenantId: fromAccount.tenantId,
		label: `Fund Transfer ${fromAccount.title} -> ${toAccount.title}`,
		accountId: fromAccount.id,
		note: `${data.amount} transfer from ${fromAccount.title} to ${toAccount.title}`,
		transactionBy,
	}
	const result = await prisma.$transaction(async tx => {
		await tenantAccountDB.decrementBalance(fromAccount.id, amount, tx)
		await tenantAccountDB.incrementBalance(toAccount.id, amount, tx)
		await transactionDB.create(transactionData, tx)
		return true
	})

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ACCOUNTS.TAG(fromAccount.tenantId),
		CACHE_KEYS.TRANSACTIONS.TAG(fromAccount.tenantId),
	])

	return result
}

export async function depositService({
	data,
	transactionBy,
}: {
	data: DepositPayloadInput
	transactionBy: string
}) {
	const amount = new Decimal(data.amount.toString())
	const existingAccount = await getTenantAccountByIdService({
		id: data.accountId,
	})
	if (!existingAccount) {
		throw new Error('Account not found')
	}
	const transactionData = {
		amount,
		type: TransactionTypeSchema.Enum.DEPOSIT,
		tenantId: data.tenantId,
		label: `Deposit to ${existingAccount.title}`,
		accountId: data.accountId,
		note: `${data.amount} deposit to ${existingAccount.title}`,
		transactionBy,
	}

	const result = await prisma.$transaction(async tx => {
		await tenantAccountDB.incrementBalance(data.accountId!, amount, tx)
		await transactionDB.create(transactionData, tx)
		return true
	})

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ACCOUNTS.TAG(data.tenantId),
		CACHE_KEYS.TRANSACTIONS.TAG(data.tenantId),
	])

	return result
}

export async function withdrawalService({
	data,
	transactionBy,
}: {
	data: WithdrawPayloadInput
	transactionBy: string
}) {
	const amount = new Decimal(data.amount.toString())
	const existingAccount = await getTenantAccountByIdService({
		id: data.accountId,
	})
	if (!existingAccount) {
		throw new Error('Account not found')
	}
	if (amount.gt(existingAccount.balance)) {
		throw new Error(
			`Not enough balance for withdrawal on: ${existingAccount.title}`,
		)
	}
	const transactionData = {
		amount,
		type: TransactionTypeSchema.Enum.WITHDRAWAL,
		tenantId: data.tenantId,
		label: `Withdrawal from ${existingAccount.title}`,
		accountId: data.accountId,
		note: `${data.amount} withdrawal from ${existingAccount.title}`,
		transactionBy,
	}

	const result = await prisma.$transaction(async tx => {
		await tenantAccountDB.decrementBalance(data.accountId!, amount, tx)
		await transactionDB.create(transactionData, tx)
		return true
	})

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ACCOUNTS.TAG(data.tenantId),
		CACHE_KEYS.TRANSACTIONS.TAG(data.tenantId),
	])

	return result
}

export async function getAllTenantAccountsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => tenantAccountDB.getAllTenantAccounts(tenantId),
		{
			key: CACHE_KEYS.TENANT_ACCOUNTS.KEY(tenantId),
			tags: [CACHE_KEYS.TENANT_ACCOUNTS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getTenantAccountByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => tenantAccountDB.getTenantAccountById(id),
		{
			key: CACHE_KEYS.TENANT_ACCOUNTS.KEY(id),
			tags: [CACHE_KEYS.TENANT_ACCOUNTS.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function updateTenantAccountService({
	id,
	data,
}: {
	id: string
	data: UpdateTenantAccountInput
}) {
	const existing = await tenantAccountDB.getTenantAccountById(id)
	if (!existing) {
		throw new Error('Tenant Account not found')
	}

	const result = await tenantAccountDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ACCOUNTS.TAG(existing.tenantId),
	])

	return result
}

export async function deleteTenantAccountService({ id }: { id: string }) {
	const existing = await tenantAccountDB.getTenantAccountById(id)
	if (!existing) {
		throw new Error('Tenant Account not found')
	}

	await tenantAccountDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.TENANT_ACCOUNTS.TAG(existing.tenantId),
	])
}
