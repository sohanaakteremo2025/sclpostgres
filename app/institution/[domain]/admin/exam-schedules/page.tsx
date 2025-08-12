import CardWrapper from '@/components/card-wrapper'
import ExamScheduleForm from '@/features/examination-management/examSchedules/components/exam-schedule-form'
import React from 'react'
import { SearchParams } from '@/types'
import { getTenantId } from '@/lib/tenant'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import ExamScheduleTable from '@/features/examination-management/examSchedules/components/exam-schedule-table'
import OrganizedExamSchedules from '@/features/examination-management/examSchedules/components/organized-exam-schedules'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function ExamSchedulePage({
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
			id: true,
			date: true,
			startTime: true,
			endTime: true,
			room: true,
			examId: true,
			classId: true,
			sectionId: true,
			subjectId: true,
			invigilators: {
				select: {
					id: true,
					name: true,
				},
			},
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
					title: true,
				},
			},
			subject: {
				select: {
					name: true,
				},
			},

			components: {
				select: {
					name: true,
					maxMarks: true,
					order: true,
				},
			},
			createdAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.EXAM_SCHEDULES.KEY(tenantId),
			tags: [CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId)],
		},
	})
	return (
		<CardWrapper title="Exam Schedules" description="Manage exam schedules and track completion">
			<Tabs defaultValue="organized" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="organized">Organized View</TabsTrigger>
					<TabsTrigger value="table">Table View</TabsTrigger>
				</TabsList>
				<TabsContent value="organized" className="mt-6">
					<OrganizedExamSchedules />
				</TabsContent>
				<TabsContent value="table" className="mt-6">
					<ExamScheduleTable dataPromise={dataPromise} />
				</TabsContent>
			</Tabs>
		</CardWrapper>
	)
}
