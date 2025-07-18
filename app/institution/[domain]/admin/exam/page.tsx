import CardWrapper from '@/components/card-wrapper'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import ExamTable from '@/features/examination-management/exams/components/ExamTable'
import { getTenantId } from '@/lib/tenant'
import { SearchParams } from '@/types'

// Example usage component
export default async function ExamPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams
	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'exam',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			title: true,
			startDate: true,
			endDate: true,
			examTypeId: true,
			examType: {
				select: {
					name: true,
					weight: true,
				},
			},
			sessionId: true,
			session: {
				select: {
					title: true,
				},
			},
			createdAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.EXAMS.KEY(tenantId),
			tags: [CACHE_KEYS.EXAMS.TAG(tenantId)],
		},
	})
	return (
		<CardWrapper title="Exams" description="Manage your exams">
			<ExamTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
