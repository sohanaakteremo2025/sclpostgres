import type { SearchParams } from '@/types'
import * as React from 'react'
import { queryModel } from '@/components/prisma-data-table'
import ClassTable from '@/features/academic-management/classes/components/class-table'
import { getTenantId } from '@/lib/tenant'
import { CACHE_KEYS } from '@/constants/cache'

// If this is a dynamic route like [domain]/[model]/page.tsx
interface ClassPageProps {
	searchParams: Promise<SearchParams>
}

export default async function ClassPage({ searchParams }: ClassPageProps) {
	const searchParamsData = await searchParams

	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'class',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			name: true,
			createdAt: true,
			sections: {
				select: { name: true },
			},
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.CLASSES.KEY(tenantId),
			tags: [CACHE_KEYS.CLASSES.TAG(tenantId)],
		},
	})

	return <ClassTable dataPromise={dataPromise} />
}
