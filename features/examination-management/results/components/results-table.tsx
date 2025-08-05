'use client'

import { useState } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
	MoreHorizontal, 
	Eye, 
	Edit, 
	Download, 
	Send,
	CheckCircle,
	XCircle,
	Clock,
	TrendingUp,
	TrendingDown
} from 'lucide-react'
import { ResultDetailsDialog } from './result-details-dialog'

interface ExamResult {
	id: string
	student: {
		id: string
		name: string
		roll: string
		photo?: string
	}
	examSchedule: {
		id: string
		exam: {
			title: string
			examType: {
				name: string
			}
		}
		subject: {
			name: string
		}
		class: {
			name: string
		}
		section?: {
			name: string
		}
		date: string
	}
	obtainedMarks: number
	totalMarks: number
	percentage?: number
	grade?: string
	isAbsent: boolean
	isPublished: boolean
	componentResults: {
		id: string
		examComponent: {
			name: string
			maxMarks: number
		}
		obtainedMarks: number
		isAbsent: boolean
		remarks?: string
	}[]
	trend?: 'up' | 'down' | 'stable'
}

interface ResultsTableProps {
	results: ExamResult[]
	loading: boolean
	error: any
}

export function ResultsTable({ results, loading, error }: ResultsTableProps) {
	const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
	const [detailsOpen, setDetailsOpen] = useState(false)

	const handleViewDetails = (result: ExamResult) => {
		setSelectedResult(result)
		setDetailsOpen(true)
	}

	const getGradeBadgeVariant = (grade?: string) => {
		if (!grade) return 'secondary'
		if (grade.startsWith('A')) return 'default'
		if (grade.startsWith('B')) return 'secondary' 
		if (grade.startsWith('C')) return 'outline'
		return 'destructive'
	}

	const getPerformanceTrend = (trend?: string) => {
		switch (trend) {
			case 'up':
				return <TrendingUp className="h-4 w-4 text-green-600" />
			case 'down':
				return <TrendingDown className="h-4 w-4 text-red-600" />
			default:
				return null
		}
	}

	if (loading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
				<h3 className="text-lg font-semibold mb-2">Error Loading Results</h3>
				<p className="text-muted-foreground mb-4">
					There was an error loading the exam results. Please try again.
				</p>
				<Button onClick={() => {
					if (typeof window !== 'undefined') {
						window.location.reload()
					}
				}}>
					Retry
				</Button>
			</div>
		)
	}

	if (results.length === 0) {
		return (
			<div className="text-center py-12">
				<Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<h3 className="text-lg font-semibold mb-2">No Results Found</h3>
				<p className="text-muted-foreground">
					No exam results match your current filters. Try adjusting your search criteria.
				</p>
			</div>
		)
	}

	return (
		<>
			<div className="border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Student</TableHead>
							<TableHead>Exam Details</TableHead>
							<TableHead>Class/Section</TableHead>
							<TableHead className="text-center">Marks</TableHead>
							<TableHead className="text-center">Percentage</TableHead>
							<TableHead className="text-center">Grade</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-center">Trend</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{results.map((result) => (
							<TableRow key={result.id} className="hover:bg-muted/50">
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-8 w-8">
											<AvatarImage src={result.student.photo} />
											<AvatarFallback>
												{result.student.name.split(' ').map(n => n[0]).join('')}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{result.student.name}</p>
											<p className="text-sm text-muted-foreground">
												Roll: {result.student.roll}
											</p>
										</div>
									</div>
								</TableCell>
								
								<TableCell>
									<div>
										<p className="font-medium">{result.examSchedule.exam.title}</p>
										<p className="text-sm text-muted-foreground">
											{result.examSchedule.subject.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{result.examSchedule.exam.examType.name} • {result.examSchedule.date}
										</p>
									</div>
								</TableCell>

								<TableCell>
									<div>
										<p className="font-medium">{result.examSchedule.class.name}</p>
										{result.examSchedule.section && (
											<p className="text-sm text-muted-foreground">
												Section {result.examSchedule.section.name}
											</p>
										)}
									</div>
								</TableCell>

								<TableCell className="text-center">
									{result.isAbsent ? (
										<Badge variant="destructive">Absent</Badge>
									) : (
										<div>
											<p className="font-medium">
												{result.obtainedMarks}/{result.totalMarks}
											</p>
											<p className="text-xs text-muted-foreground">
												{result.componentResults.length} components
											</p>
										</div>
									)}
								</TableCell>

								<TableCell className="text-center">
									{result.isAbsent ? (
										<span className="text-muted-foreground">-</span>
									) : (
										<p className="font-medium">
											{result.percentage?.toFixed(1)}%
										</p>
									)}
								</TableCell>

								<TableCell className="text-center">
									{result.grade && !result.isAbsent ? (
										<Badge variant={getGradeBadgeVariant(result.grade)}>
											{result.grade}
										</Badge>
									) : (
										<span className="text-muted-foreground">-</span>
									)}
								</TableCell>

								<TableCell className="text-center">
									{result.isPublished ? (
										<Badge variant="default" className="bg-green-100 text-green-800">
											<CheckCircle className="h-3 w-3 mr-1" />
											Published
										</Badge>
									) : (
										<Badge variant="secondary">
											<Clock className="h-3 w-3 mr-1" />
											Pending
										</Badge>
									)}
								</TableCell>

								<TableCell className="text-center">
									{getPerformanceTrend(result.trend)}
								</TableCell>

								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuItem 
												onClick={() => handleViewDetails(result)}
											>
												<Eye className="mr-2 h-4 w-4" />
												View Details
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Edit className="mr-2 h-4 w-4" />
												Edit Result
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>
												<Download className="mr-2 h-4 w-4" />
												Download Report
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Send className="mr-2 h-4 w-4" />
												Send to Student
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination would go here */}
			<div className="flex items-center justify-between px-2 py-4">
				<div className="text-sm text-muted-foreground">
					Showing {results.length} results
				</div>
				<div className="flex items-center space-x-2">
					{/* Pagination controls would be implemented here */}
				</div>
			</div>

			{/* Result Details Dialog */}
			{selectedResult && (
				<ResultDetailsDialog
					result={selectedResult}
					open={detailsOpen}
					onOpenChange={(open) => {
						setDetailsOpen(open)
						if (!open) {
							setSelectedResult(null)
						}
					}}
				/>
			)}
		</>
	)
}