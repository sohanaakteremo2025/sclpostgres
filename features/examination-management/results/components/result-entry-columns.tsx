'use client'
import { createColumns } from '@/components/prisma-data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { formatTimeForDisplay } from '@/utils/time-fomatter'
import { 
	Calendar, 
	Clock, 
	Users, 
	FileText, 
	BarChart3, 
	Eye, 
	CheckCircle, 
	XCircle,
	BookOpen,
	School,
	PenTool
} from 'lucide-react'

export const resultEntryColumns = createColumns<any>({
	'exam.title': {
		type: 'custom',
		header: 'Exam',
		icon: FileText,
		className: 'font-semibold min-w-[200px]',
		enableFilter: true,
		sortable: true,
		filter: {
			placeholder: 'Search exam...',
			type: 'text',
		},
		render: (value, row) => (
			<div className="space-y-1">
				<div className="font-medium">{value}</div>
				<Badge variant="outline" className="text-xs">
					{row.exam?.examType?.name}
				</Badge>
			</div>
		),
	},

	'subject.name': {
		type: 'custom',
		header: 'Subject',
		icon: BookOpen,
		className: 'font-medium',
		enableFilter: true,
		sortable: true,
		filter: {
			placeholder: 'Filter subjects...',
			type: 'text',
		},
		render: (value) => (
			<div className="flex items-center gap-2">
				<BookOpen className="h-4 w-4 text-muted-foreground" />
				<span>{value}</span>
			</div>
		),
	},

	'class.name': {
		type: 'custom',
		header: 'Class & Section',
		icon: School,
		className: 'font-medium',
		enableFilter: true,
		sortable: true,
		filter: {
			placeholder: 'Filter class...',
			type: 'text',
		},
		render: (value, row) => (
			<div className="flex items-center gap-2">
				<School className="h-4 w-4 text-muted-foreground" />
				<span>
					{value}
					{row.section?.name && ` - ${row.section.name}`}
				</span>
			</div>
		),
	},

	date: {
		type: 'date',
		header: 'Exam Date',
		icon: Calendar,
		className: 'font-medium',
		enableFilter: true,
		sortable: true,
		filter: {
			placeholder: 'Filter by date...',
			type: 'dateRange',
		},
		format: (date) => formatDate(date),
	},

	startTime: {
		type: 'custom',
		header: 'Time',
		icon: Clock,
		className: 'text-center',
		enableFilter: false,
		sortable: true,
		render: (value, row) => (
			<div className="flex items-center gap-1 justify-center">
				<Clock className="h-3 w-3 text-muted-foreground" />
				<span className="text-xs">
					{formatTimeForDisplay(value, '12')} - {formatTimeForDisplay(row.endTime, '12')}
				</span>
			</div>
		),
	},

	components: {
		type: 'custom',
		header: 'Components',
		className: 'min-w-[150px]',
		enableFilter: false,
		sortable: false,
		render: (components) => (
			<div className="flex flex-wrap gap-1">
				{components?.length > 0 ? (
					components
						.sort((a: any, b: any) => a.order - b.order)
						.map((component: any) => (
							<Badge key={component.id} variant="secondary" className="text-xs">
								{component.name} ({component.maxMarks})
							</Badge>
						))
				) : (
					<span className="text-muted-foreground text-sm">No components</span>
				)}
			</div>
		),
	},

	// Result entry status
	resultStatus: {
		type: 'custom',
		header: 'Result Status',
		className: 'text-center',
		enableFilter: true,
		sortable: true,
		filter: {
			type: 'multiSelect',
			placeholder: 'Filter status...',
			options: [
				{ value: 'not-entered', label: 'Not Entered' },
				{ value: 'partial', label: 'Partial' },
				{ value: 'completed', label: 'Completed' },
				{ value: 'published', label: 'Published' },
			],
		},
		render: (_, row) => {
			// Calculate status based on results and publication
			const hasResults = row.results && row.results.length > 0
			const isPublished = row.resultPublish && row.resultPublish.length > 0 && 
							   row.resultPublish.some((rp: any) => rp.isPublished)
			
			if (isPublished) {
				return (
					<Badge variant="default" className="bg-green-100 text-green-800">
						<CheckCircle className="h-3 w-3 mr-1" />
						Published
					</Badge>
				)
			}
			
			if (hasResults) {
				// Check if all expected students have results
				const expectedStudents = row._count?.expectedStudents || 0
				const actualResults = row.results.length
				
				if (actualResults >= expectedStudents) {
					return (
						<Badge variant="secondary" className="bg-blue-100 text-blue-800">
							<FileText className="h-3 w-3 mr-1" />
							Completed
						</Badge>
					)
				} else {
					return (
						<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
							<PenTool className="h-3 w-3 mr-1" />
							Partial ({actualResults}/{expectedStudents})
						</Badge>
					)
				}
			}
			
			return (
				<Badge variant="outline" className="text-muted-foreground">
					<XCircle className="h-3 w-3 mr-1" />
					Not Entered
				</Badge>
			)
		},
	},

	// Student count
	studentCount: {
		type: 'custom',
		header: 'Students',
		icon: Users,
		className: 'text-center',
		enableFilter: false,
		sortable: true,
		render: (_, row) => {
			const resultCount = row.results?.length || 0
			const expectedCount = row._count?.expectedStudents || 0
			
			return (
				<div className="flex items-center gap-1 justify-center">
					<Users className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm">
						{resultCount}/{expectedCount}
					</span>
				</div>
			)
		},
	},

	createdAt: {
		type: 'date',
		header: 'Created',
		icon: Calendar,
		className: 'text-muted-foreground text-sm',
		enableFilter: true,
		sortable: true,
		filter: {
			type: 'dateRange',
		},
		format: (date) => formatDate(date),
	},

	actions: {
		type: 'actions',
		actions: ['enter-results', 'view-statistics', 'publish-results'],
		actionConfig: {
			'enter-results': {
				icon: PenTool,
				label: 'Enter Results',
				className: 'text-blue-600 hover:text-blue-800',
			},
			'view-statistics': {
				icon: BarChart3,
				label: 'View Statistics',
				className: 'text-green-600 hover:text-green-800',
			},
			'publish-results': {
				icon: CheckCircle,
				label: 'Publish Results',
				className: 'text-purple-600 hover:text-purple-800',
				// condition: (row: any) => {
				// 	// Only show publish action if results are completed but not published
				// 	const hasResults = row.results && row.results.length > 0
				// 	const isPublished = row.resultPublish && row.resultPublish.length > 0 && 
				// 					   row.resultPublish.some((rp: any) => rp.isPublished)
				// 	return hasResults && !isPublished
				// },
			},
		},
	},
})