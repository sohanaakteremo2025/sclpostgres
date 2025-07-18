import React from 'react'
import SessionTable from '@/features/academic-management/sessions/components/session-table'
import { queryModel } from '@/components/prisma-data-table'
import { getTenantId } from '@/lib/tenant'
import { CACHE_KEYS } from '@/constants/cache'
import { SearchParams } from '@/types'

export default async function AcademicSessionPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const tenantId = await getTenantId()
	const searchParamsData = await searchParams

	const dataPromise = queryModel({
		model: 'academicSession',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			title: true,
			startDate: true,
			endDate: true,
			status: true,
			createdAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.SESSIONS.KEY(tenantId),
			tags: [CACHE_KEYS.SESSIONS.TAG(tenantId)],
		},
	})
	return <SessionTable dataPromise={dataPromise} />
}
