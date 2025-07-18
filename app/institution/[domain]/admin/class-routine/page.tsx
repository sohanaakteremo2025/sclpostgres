import { getTenantId } from '@/lib/tenant'
import { SearchParams } from '@/types'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'

import CardWrapper from '@/components/card-wrapper'
import { BookOpen } from 'lucide-react'
import ClassRoutineTable from '@/features/academic-management/classRoutines/components/classRoutine-table'

export default async function ClassRoutinePage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const tenantId = await getTenantId()
	const dataPromise = queryModel({
		model: 'classRoutine',
		tenantId,
		searchParams: await searchParams,
		select: {
			id: true,
			dayOfWeek: true,
			startTime: true,
			endTime: true,
			room: true,
			createdAt: true,
			class: {
				select: {
					name: true,
				},
			},
			section: {
				select: {
					name: true,
				},
			},
			teacher: {
				select: {
					name: true,
				},
			},
			subject: {
				select: {
					name: true,
				},
			},
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.CLASS_ROUTINES.KEY(tenantId),
			tags: [CACHE_KEYS.CLASS_ROUTINES.TAG(tenantId)],
		},
	})

	return (
		<CardWrapper
			title="Class Routines"
			description="List of all class routines"
			icon={<BookOpen />}
		>
			<ClassRoutineTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
