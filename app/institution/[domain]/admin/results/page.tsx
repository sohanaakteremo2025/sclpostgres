import { ResultsPageClient } from '@/features/examination-management/results/components/results-page-client'
import { Metadata } from 'next'
import { Suspense } from 'react'
// import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
	title: 'Exam Results | School Management',
	description: 'View and manage exam results, statistics, and generate reports',
}

export default function ResultsPage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	return (
		<div className="space-y-6">
			<Suspense fallback={<div>Loading results...</div>}>
				<ResultsPageClient searchParams={searchParams} />
			</Suspense>
		</div>
	)
}
