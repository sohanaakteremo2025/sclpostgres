import React from 'react'
import { SearchParams } from '@/types'
import { queryModel } from '@/components/prisma-data-table'
import TenantTable from '@/features/cms-management/tenant/components/tenant-table'
import { CACHE_KEYS } from '@/constants/cache'

export default async function TenantListPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams

	const dataPromise = queryModel({
		model: 'tenant',
		tenantId: '',
		searchParams: searchParamsData,
		select: {
			id: true,
			name: true,
			logo: true,
			phone: true,
			address: true,
			email: true,
			domain: true,
			createdAt: true,
			status: true,
			billingSchedules: {
				select: {
					id: true,
					tenantId: true,
					label: true,
					billingType: true,
					amount: true,
					frequency: true,
					nextDueDate: true,
					status: true,
				},
			},
			messages: {
				select: {
					id: true,
					tenantId: true,
					author: true,
					title: true,
					message: true,
					photo: true,
				},
			},
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.TENANTS.BASE,
			tags: [CACHE_KEYS.TENANTS.TAG],
		},
	})
	return <TenantTable dataPromise={dataPromise} />
}
