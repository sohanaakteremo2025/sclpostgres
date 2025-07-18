'use server'

import {
	CreateTenantAccountInput,
	CreateTenantAccountPayload,
	UpdateTenantAccountInput,
} from '@/lib/zod'
import {
	createTenantAccountService,
	getAllTenantAccountsService,
	getTenantAccountByIdService,
	updateTenantAccountService,
	deleteTenantAccountService,
	fundTransferService,
	depositService,
	withdrawalService,
} from '../services/tenantAccount.service'

import { getTenantId } from '@/lib/tenant'
import { DepositInput, FundTransferInput } from '../types'
import { auth } from '@/auth'

export async function createTenantAccount(data: CreateTenantAccountInput) {
	const tenantId = await getTenantId()

	return await createTenantAccountService({ data: { ...data, tenantId } })
}

export async function getAllTenantAccounts() {
	const tenantId = await getTenantId()

	return await getAllTenantAccountsService({
		tenantId,
	})
}

export async function getTenantAccountById(id: string) {
	return await getTenantAccountByIdService({
		id,
	})
}

export async function updateTenantAccount(
	id: string,
	data: UpdateTenantAccountInput,
) {
	return await updateTenantAccountService({
		id,
		data,
	})
}

export async function deleteTenantAccount(id: string) {
	return await deleteTenantAccountService({
		id,
	})
}

export async function fundTransfer(data: FundTransferInput) {
	const session = await auth()
	return await fundTransferService({
		data,
		transactionBy: session?.user?.name || '',
	})
}

export async function depositFund(data: { accountId: string; amount: number }) {
	const session = await auth()
	const tenantId = await getTenantId()
	return await depositService({
		data: { ...data, tenantId },
		transactionBy: session?.user?.name || '',
	})
}

export async function withdrawFund(data: {
	accountId: string
	amount: number
}) {
	const session = await auth()
	const tenantId = await getTenantId()
	return await withdrawalService({
		data: { ...data, tenantId },
		transactionBy: session?.user?.name || '',
	})
}
