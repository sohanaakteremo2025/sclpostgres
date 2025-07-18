import React from 'react'
import { SearchParams } from '@/types'
import UsersTable from '@/features/user-management/users/components/user-table'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'

export default async function TenantAdminsPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams

	const dataPromise = queryModel({
		model: 'user',
		tenantId: '',
		searchParams: searchParamsData,
		select: {
			id: true,
			tenantId: true,
			tenant: {
				select: {
					id: true,
					name: true,
					domain: true,
				},
			},
			password: true,
			name: true,
			photo: true,
			email: true,
			role: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
		where: {
			role: 'ADMIN',
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.TENANT_ADMINS.KEY,
			tags: [CACHE_KEYS.TENANT_ADMINS.TAG],
		},
	})
	return <UsersTable dataPromise={dataPromise} />
}
