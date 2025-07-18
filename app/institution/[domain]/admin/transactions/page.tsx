import React from 'react'
import { SearchParams } from '@/types'
import { getTenantId } from '@/lib/tenant'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import TransactionTable from '@/features/financial-management/transactions/components/transaction-table'

export default async function TransactionsPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams

	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'tenantTransaction',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			label: true,
			amount: true,
			note: true,
			categoryId: true,
			accountId: true,
			type: true,
			transactionBy: true,
			createdAt: true,
			updatedAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.TRANSACTIONS.TAG(tenantId),
			tags: [CACHE_KEYS.TRANSACTIONS.TAG(tenantId)],
		},
	})
	return <TransactionTable dataPromise={dataPromise} />
}
