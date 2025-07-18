import React from 'react'
import TenantAccountTable from '@/features/financial-management/tenantAccount/components/tenant-account-table'
import { SearchParams } from '@/types'
import { getTenantId } from '@/lib/tenant'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import { Wallet } from 'lucide-react'
import CardWrapper from '@/components/card-wrapper'

export default async function TenantAccountPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams

	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'tenantAccount',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			title: true,
			balance: true,
			type: true,
			createdAt: true,
			updatedAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.TENANT_ACCOUNTS.KEY(tenantId),
			tags: [CACHE_KEYS.TENANT_ACCOUNTS.TAG(tenantId)],
		},
	})
	return (
		<CardWrapper
			title="Financial Accounts"
			icon={<Wallet className="h-5 w-5" />}
			description="Manage your financial accounts"
		>
			<TenantAccountTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
