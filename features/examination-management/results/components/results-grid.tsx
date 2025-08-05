'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
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
	TrendingDown,
	Calendar,
	BookOpen,
	User
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

interface ResultsGridProps {
	results: ExamResult[]
	loading: boolean
	error: any
}

export function ResultsGrid({ results, loading, error }: ResultsGridProps) {
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

	const getPerformanceColor = (percentage?: number) => {
		if (!percentage) return 'text-muted-foreground'
		if (percentage >= 90) return 'text-green-600'
		if (percentage >= 75) return 'text-blue-600'
		if (percentage >= 60) return 'text-yellow-600'
		return 'text-red-600'
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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<div className="animate-pulse space-y-4">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 bg-gray-200 rounded-full"></div>
									<div className="space-y-2 flex-1">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-3 bg-gray-200 rounded w-1/2"></div>
									</div>
								</div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded"></div>
									<div className="h-3 bg-gray-200 rounded w-2/3"></div>
								</div>
							</div>
						</CardContent>
					</Card>
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
				<Button onClick={() => window.location.reload()}>
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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{results.map((result) => (
					<Card key={result.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10">
										<AvatarImage src={result.student.photo} />
										<AvatarFallback>
											{result.student.name.split(' ').map(n => n[0]).join('')}
										</AvatarFallback>
									</Avatar>
									<div>
										<CardTitle className="text-base">{result.student.name}</CardTitle>
										<p className="text-sm text-muted-foreground">
											Roll: {result.student.roll}
										</p>
									</div>
								</div>
								
								<div className="flex items-center gap-2">
									{getPerformanceTrend(result.trend)}
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
								</div>
							</div>
						</CardHeader>
						
						<CardContent className="space-y-4">
							{/* Exam Info */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<BookOpen className="h-4 w-4 text-muted-foreground" />
									<div className="flex-1">
										<p className="font-medium text-sm">{result.examSchedule.exam.title}</p>
										<p className="text-xs text-muted-foreground">
											{result.examSchedule.subject.name}
										</p>
									</div>
								</div>
								
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Calendar className="h-3 w-3" />
									<span>{result.examSchedule.date}</span>
									<Badge variant="outline" className="text-xs">
										{result.examSchedule.exam.examType.name}
									</Badge>
								</div>
								
								<div className="flex items-center gap-2 text-xs">
									<User className="h-3 w-3 text-muted-foreground" />
									<span className="text-muted-foreground">
										{result.examSchedule.class.name}
										{result.examSchedule.section && ` - Section ${result.examSchedule.section.name}`}
									</span>
								</div>
							</div>

							{/* Performance */}
							{result.isAbsent ? (
								<div className="text-center py-4 border border-red-200 rounded-lg bg-red-50">
									<XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
									<Badge variant="destructive">Absent</Badge>
								</div>
							) : (
								<div className="space-y-3">
									{/* Marks and Percentage */}
									<div className="flex items-center justify-between">
										<div className="text-center">
											<p className="text-lg font-bold">
												{result.obtainedMarks}/{result.totalMarks}
											</p>
											<p className="text-xs text-muted-foreground">Total Marks</p>
										</div>
										
										<div className="text-center">
											<p className={`text-lg font-bold ${getPerformanceColor(result.percentage)}`}>
												{result.percentage?.toFixed(1)}%
											</p>
											<p className="text-xs text-muted-foreground">Percentage</p>
										</div>
										
										<div className="text-center">
											{result.grade ? (
												<Badge variant={getGradeBadgeVariant(result.grade)} className="text-sm">
													{result.grade}
												</Badge>
											) : (
												<span className="text-sm text-muted-foreground">No Grade</span>
											)}
											<p className="text-xs text-muted-foreground mt-1">Grade</p>
										</div>
									</div>

									{/* Progress Bar */}
									<div className="space-y-1">
										<Progress value={result.percentage} className="h-2" />
										<p className="text-xs text-muted-foreground">
											{result.componentResults.length} component{result.componentResults.length !== 1 ? 's' : ''}
										</p>
									</div>
								</div>
							)}

							{/* Status and Actions */}
							<div className="flex items-center justify-between pt-2 border-t">
								<div>
									{result.isPublished ? (
										<Badge variant="default" className="bg-green-100 text-green-800 text-xs">
											<CheckCircle className="h-3 w-3 mr-1" />
											Published
										</Badge>
									) : (
										<Badge variant="secondary" className="text-xs">
											<Clock className="h-3 w-3 mr-1" />
											Pending
										</Badge>
									)}
								</div>
								
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => handleViewDetails(result)}
								>
									<Eye className="h-3 w-3 mr-1" />
									View
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between px-2 py-4">
				<div className="text-sm text-muted-foreground">
					Showing {results.length} results
				</div>
				<div className="flex items-center space-x-2">
					{/* Pagination controls would be implemented here */}
				</div>
			</div>

			{/* Result Details Dialog */}
			<ResultDetailsDialog
				result={selectedResult}
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
			/>
		</>
	)
}