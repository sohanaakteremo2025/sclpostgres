// app/[model]/page.tsx
import type { SearchParams } from '@/types'
import * as React from 'react'
import { queryModel } from '@/components/prisma-data-table'
import FeeStructuresTable from '@/features/financial-management/fee-structure/components/feestructure-table'
import { getTenantId } from '@/lib/tenant'
import { CACHE_KEYS } from '@/constants/cache'

interface ModelPageProps {
	searchParams: Promise<SearchParams>
}

export default async function FeeStructurePage(props: ModelPageProps) {
	const searchParams = await props.searchParams
	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'feeStructure',
		tenantId,
		searchParams: searchParams,
		select: {
			id: true,
			title: true,
			createdAt: true,
			feeItems: {
				select: {
					id: true,
					name: true,
					amount: true,
					categoryId: true,
					description: true,
					frequency: true,
					lateFeeEnabled: true,
					lateFeeFrequency: true,
					lateFeeAmount: true,
					lateFeeGraceDays: true,
					status: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
		cacheOptions: {
			cacheKey: CACHE_KEYS.FEE_STRUCTURES.KEY(tenantId),
			tags: [CACHE_KEYS.FEE_STRUCTURES.TAG(tenantId)],
			revalidate: 300,
		},
	})

	return <FeeStructuresTable dataPromise={dataPromise} />
}
