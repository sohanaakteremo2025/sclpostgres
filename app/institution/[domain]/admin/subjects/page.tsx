import { getTenantId } from '@/lib/tenant'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import { SearchParams } from '@/types'
import SubjectTable from '@/features/academic-management/subjects/components/subject-table'
import CardWrapper from '@/components/card-wrapper'
import { BookOpen } from 'lucide-react'

export default async function SubjectPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const tenantId = await getTenantId()

	const dataPromise = queryModel({
		model: 'subject',
		tenantId,
		searchParams: await searchParams,
		select: {
			id: true,
			name: true,
			type: true,
			code: true,
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
			createdAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.SUBJECTS.KEY(tenantId),
			tags: [CACHE_KEYS.SUBJECTS.TAG(tenantId)],
		},
	})

	return (
		<CardWrapper
			title="Subjects"
			description="List of all subjects"
			icon={<BookOpen />}
		>
			<SubjectTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
