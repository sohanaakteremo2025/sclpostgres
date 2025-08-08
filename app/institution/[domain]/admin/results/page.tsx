import { StudentMarksheetList } from '@/features/examination-management/results/components/student-marksheet-list'
import { ResultsPageClient } from '@/features/examination-management/results/components/results-page-client'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, FileText, BarChart } from 'lucide-react'

export const metadata: Metadata = {
	title: 'Exam Results | School Management',
	description: 'View exam results, generate marksheets, and analyze student performance',
}

export default async function ResultsPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const resolvedSearchParams = await searchParams
	const defaultTab = (resolvedSearchParams.tab as string) || 'marksheets'

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart className="h-6 w-6" />
						Exam Results Management
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue={defaultTab} className="space-y-6">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="marksheets" className="flex items-center gap-2">
								<GraduationCap className="h-4 w-4" />
								Student Marksheets
							</TabsTrigger>
							<TabsTrigger value="results" className="flex items-center gap-2">
								<FileText className="h-4 w-4" />
								All Results
							</TabsTrigger>
						</TabsList>

						<TabsContent value="marksheets" className="space-y-6">
							<Suspense fallback={<div>Loading students...</div>}>
								<StudentMarksheetList
									defaultFilters={{
										classId: resolvedSearchParams.classId as string,
										sectionId: resolvedSearchParams.sectionId as string,
										sessionId: resolvedSearchParams.sessionId as string,
									}}
								/>
							</Suspense>
						</TabsContent>

						<TabsContent value="results" className="space-y-6">
							<Suspense fallback={<div>Loading results...</div>}>
								<ResultsPageClient searchParams={resolvedSearchParams} />
							</Suspense>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
