import { Suspense } from 'react'
import { Metadata } from 'next'
import { ResultsPageClient } from '@/features/examination-management/results/components/results-page-client'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { FileText, BarChart3, Download } from 'lucide-react'
import Link from 'next/link'

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
			<PageHeader
				title="Exam Results"
				description="View exam results, analyze performance, and generate reports"
				action={
					<div className="flex gap-2">
						<Link href="/admin/results/analytics">
							<Button variant="outline" size="sm">
								<BarChart3 className="h-4 w-4 mr-2" />
								Analytics
							</Button>
						</Link>
						<Link href="/admin/results/reports">
							<Button variant="outline" size="sm">
								<FileText className="h-4 w-4 mr-2" />
								Reports
							</Button>
						</Link>
						<Button variant="outline" size="sm">
							<Download className="h-4 w-4 mr-2" />
							Export
						</Button>
					</div>
				}
			/>

			<Suspense fallback={<div>Loading results...</div>}>
				<ResultsPageClient searchParams={searchParams} />
			</Suspense>
		</div>
	)
}