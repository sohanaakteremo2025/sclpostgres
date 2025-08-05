import CardWrapper from '@/components/card-wrapper'
import { queryModel } from '@/components/prisma-data-table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CACHE_KEYS } from '@/constants/cache'
import {
	DataLoadingErrorFallback,
	ResultEntryErrorBoundary,
} from '@/features/examination-management/results/components/error-boundary'
import ResultEntryTable from '@/features/examination-management/results/components/result-entry-table'
import { getTenantId } from '@/lib/tenant'
import { SearchParams } from '@/types'
import { AlertCircle, FileText } from 'lucide-react'

export default async function ResultEntryPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams
	const tenantId = await getTenantId()

	try {
		// Query exam schedules with all necessary relations for result entry
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
				createdAt: true,
				updatedAt: true,

				// Exam information
				exam: {
					select: {
						id: true,
						title: true,
						startDate: true,
						endDate: true,
						examType: {
							select: {
								id: true,
								name: true,
							},
						},
						session: {
							select: {
								id: true,
								title: true,
							},
						},
					},
				},

				// Class and Section information
				class: {
					select: {
						id: true,
						name: true,
					},
				},
				section: {
					select: {
						id: true,
						name: true,
					},
				},

				// Subject information
				subject: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},

				// Exam components (Theory, Practical, etc.)
				components: {
					select: {
						id: true,
						name: true,
						maxMarks: true,
						order: true,
					},
					orderBy: {
						order: 'asc',
					},
				},

				// Existing results count
				results: {
					select: {
						id: true,
						studentId: true,
						obtainedMarks: true,
						totalMarks: true,
						percentage: true,
						grade: true,
						isAbsent: true,
					},
				},

				// Publication status
				resultPublish: {
					select: {
						id: true,
						isPublished: true,
						publishedAt: true,
						publishedBy: true,
					},
				},

				// Count of expected students (for status calculation)
				_count: {
					select: {
						results: true,
					},
				},
			},
			cacheOptions: {
				revalidate: 300, // 5 minutes cache
				cacheKey: CACHE_KEYS.EXAM_SCHEDULES.KEY(tenantId),
				tags: [
					CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId),
					CACHE_KEYS.EXAM_RESULTS.TAG(tenantId),
				],
			},
		})

		return (
			<div className="space-y-6">
				{/* Header */}
				<CardWrapper
					title="Result Entry"
					description="Enter and manage examination results for students"
					icon={<FileText className="h-5 w-5" />}
				>
					{/* Instructions */}
					<Alert className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Select an exam schedule to enter results. You can enter marks for
							individual components (Theory, Practical, etc.) and the system
							will automatically calculate total marks, percentages, and grades.
						</AlertDescription>
					</Alert>

					{/* Result Entry Table with Error Boundary */}
					<ResultEntryErrorBoundary fallback={DataLoadingErrorFallback}>
						<ResultEntryTable dataPromise={dataPromise} />
					</ResultEntryErrorBoundary>
				</CardWrapper>
			</div>
		)
	} catch (error) {
		console.error('Error loading result entry page:', error)

		return (
			<div className="space-y-6">
				<CardWrapper
					title="Result Entry"
					description="Enter and manage examination results for students"
					icon={<FileText className="h-5 w-5" />}
				>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Failed to load exam schedules. Please try refreshing the page or
							contact support if the problem persists.
						</AlertDescription>
					</Alert>
				</CardWrapper>
			</div>
		)
	}
}

// Add metadata for better SEO and page identification
export const metadata = {
	title: 'Result Entry | School Management System',
	description: 'Enter and manage examination results for students',
}
