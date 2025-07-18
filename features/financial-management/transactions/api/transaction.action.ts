'use server'

import {
	CreateTenantTransactionInput,
	CreateTenantTransactionPayload,
	UpdateTenantTransactionInput,
} from '@/lib/zod'
import {
	createTransactionService,
	getAllTransactionsService,
	getTransactionByIdService,
	updateTransactionService,
	deleteTransactionService,
	deleteManyTransactionService,
} from '../services/transaction.service'

import { getTenantId } from '@/lib/tenant'
import { auth } from '@/auth'

export async function createTransaction(data: CreateTenantTransactionInput) {
	const tenantId = await getTenantId()
	const session = await auth()

	return await createTransactionService({
		data: { ...data, tenantId, transactionBy: session?.user?.name || '' },
	})
}

export async function getAllTransactions() {
	const tenantId = await getTenantId()

	return await getAllTransactionsService({
		tenantId,
	})
}

export async function getTransactionById(id: string) {
	return await getTransactionByIdService({
		id,
	})
}

export async function updateTransaction(
	id: string,
	data: UpdateTenantTransactionInput,
) {
	return await updateTransactionService({
		id,
		data,
	})
}

export async function deleteTransaction(id: string) {
	return await deleteTransactionService({
		id,
	})
}

export async function deleteManyTransactions(ids: string[]) {
	const tenantId = await getTenantId()
	return await deleteManyTransactionService({
		ids,
		tenantId,
	})
}
