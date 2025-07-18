import { getTenantId } from '@/lib/tenant'
import { queryModel } from '@/components/prisma-data-table'
import { SearchParams } from '@/types'
import { CACHE_KEYS } from '@/constants/cache'
import ExamScheduleTable from '@/features/examination-management/examSchedules/components/exam-schedule-table'
import CardWrapper from '@/components/card-wrapper'
import { BookOpen } from 'lucide-react'

export default async function ExamRoutinePage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams
	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'examSchedule',
		tenantId,
		searchParams: searchParamsData,
		select: {
			date: true,
			startTime: true,
			endTime: true,
			room: true,
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
			exam: {
				select: {
					name: true,
				},
			},
			subject: {
				select: {
					name: true,
				},
			},
			tenantId: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.EXAM_SCHEDULES.KEY(tenantId),
			tags: [CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId)],
		},
	})

	return (
		<CardWrapper
			title="Exam Routine"
			icon={<BookOpen />}
			description="List of all exam schedules"
		>
			<ExamScheduleTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
