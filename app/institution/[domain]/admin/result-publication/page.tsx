import CardWrapper from '@/components/card-wrapper'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import { ResultPublicationTable } from '@/features/examination-management/resultPublication/components/result-publication-table'
import { getTenantId } from '@/lib/tenant'
import { SearchParams } from '@/types'

interface ResultPublicationPageProps {
	searchParams: Promise<SearchParams>
}

export default async function ResultPublicationPage({
	searchParams,
}: ResultPublicationPageProps) {
	const searchParamsData = await searchParams
	const tenantId = await getTenantId()

	// Query result publications with comprehensive relations
	const dataPromise = queryModel({
		model: 'resultPublish',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			isPublished: true,
			publishedAt: true,
			publishedBy: true,
			// createdAt: true,
			// updatedAt: true,
			// examSchedule: {
			// 	select: {
			// 		id: true,
			// 		date: true,
			// 		startTime: true,
			// 		endTime: true,
			// 		room: true,
			// 		exam: {
			// 			select: {
			// 				id: true,
			// 				title: true,
			// 				startDate: true,
			// 				endDate: true,
			// 				examType: {
			// 					select: {
			// 						id: true,
			// 						name: true,
			// 					},
			// 				},
			// 				session: {
			// 					select: {
			// 						id: true,
			// 						title: true,
			// 					},
			// 				},
			// 			},
			// 		},
			// 		class: {
			// 			select: {
			// 				id: true,
			// 				name: true,
			// 			},
			// 		},
			// 		section: {
			// 			select: {
			// 				id: true,
			// 				name: true,
			// 			},
			// 		},
			// 		subject: {
			// 			select: {
			// 				id: true,
			// 				name: true,
			// 			},
			// 		},
			// 		components: {
			// 			select: {
			// 				id: true,
			// 				name: true,
			// 				maxMarks: true,
			// 				order: true,
			// 			},
			// 			orderBy: {
			// 				order: 'asc',
			// 			},
			// 		},
			// 		results: {
			// 			select: {
			// 				id: true,
			// 				obtainedMarks: true,
			// 				totalMarks: true,
			// 				percentage: true,
			// 				grade: true,
			// 				isAbsent: true,
			// 				student: {
			// 					select: {
			// 						id: true,
			// 						name: true,
			// 						roll: true,
			// 					},
			// 				},
			// 			},
			// 		},
			// 		_count: {
			// 			select: {
			// 				results: true,
			// 			},
			// 		},
			// 	},
			// },
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.RESULT_PUBLICATIONS.KEY(tenantId),
			tags: [CACHE_KEYS.RESULT_PUBLICATIONS.TAG(tenantId)],
		},
	})

	return (
		<CardWrapper
			title="Result Publication"
			description="Manage exam result publications and visibility"
		>
			<ResultPublicationTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
