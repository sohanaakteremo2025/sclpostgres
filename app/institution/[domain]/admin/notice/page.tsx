import CardWrapper from '@/components/card-wrapper'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import NoticeTable from '@/features/communication/notices/components/notice-table'
import { getTenantId } from '@/lib/tenant'
import { SearchParams } from '@/types'
import { Building2 } from 'lucide-react'

export default async function NoticePage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const tenantId = await getTenantId()
	const searchParamsData = await searchParams
	const dataPromise = queryModel({
		model: 'notice',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			title: true,
			content: true,
			createdAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.NOTICES.KEY(tenantId),
			tags: [CACHE_KEYS.NOTICES.TAG(tenantId)],
		},
	})

	return (
		<CardWrapper
			title="Notices"
			description="Manage your notices"
			icon={<Building2 />}
		>
			<NoticeTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
