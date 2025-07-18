// app/[model]/page.tsx
import type { SearchParams } from '@/types'
import * as React from 'react'
import { queryModel } from '@/components/prisma-data-table'
import CardWrapper from '@/components/card-wrapper'
import SectionTable from '@/features/academic-management/sections/components/section-table'
import { getTenantId } from '@/lib/tenant'
import { CACHE_KEYS } from '@/constants/cache'

interface SectionPageProps {
	searchParams: Promise<SearchParams>
}

export default async function SectionPage({ searchParams }: SectionPageProps) {
	const searchParamsData = await searchParams
	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'section',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			name: true,
			classId: true,
			class: {
				select: {
					name: true,
				},
			},
			students: {
				select: {
					id: true,
				},
			},
			createdAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.SECTIONS.KEY(tenantId),
			tags: [CACHE_KEYS.SECTIONS.TAG(tenantId)],
		},
	})

	return (
		<CardWrapper title="Sections" description="Manage your sections">
			<SectionTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
