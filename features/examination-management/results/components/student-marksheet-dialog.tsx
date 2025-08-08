'use client'

import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Download,
	Send,
	TrendingUp,
	TrendingDown,
	Award,
	BookOpen,
	User,
	GraduationCap,
	Calendar,
	FileText,
	Loader2,
	AlertCircle,
} from 'lucide-react'
import { getStudentMarksheetData, getMarksheetSummary, StudentMarksheetData } from '../api/student-marksheet.action'
import { MarksheetPDF } from './marksheet-pdf'

interface Student {
	id: string
	name: string
	roll: string
	photo?: string
	studentId: string
	class: {
		id: string
		name: string
	} | null
	section: {
		id: string
		name: string
	} | null
	session: {
		id: string
		title: string
	} | null
}

interface StudentMarksheetDialogProps {
	student: Student
	sessionId?: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function StudentMarksheetDialog({ 
	student, 
	sessionId, 
	open, 
	onOpenChange 
}: StudentMarksheetDialogProps) {
	const [activeTab, setActiveTab] = useState<'marksheet' | 'summary'>('marksheet')
	const printRef = useRef<HTMLDivElement>(null)

	// Fetch marksheet data
	const {
		data: marksheetData,
		isLoading: marksheetLoading,
		error: marksheetError,
	} = useQuery({
		queryKey: ['student-marksheet', student.id, sessionId],
		queryFn: async () => {
			const response = await getStudentMarksheetData(student.id, sessionId)
			if (!response.success) {
				throw new Error(response.error)
			}
			return response.data
		},
		enabled: open && !!student.id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	})

	// Fetch summary data
	const {
		data: summaryData,
		isLoading: summaryLoading,
		error: summaryError,
	} = useQuery({
		queryKey: ['student-marksheet-summary', student.id, sessionId],
		queryFn: async () => {
			const response = await getMarksheetSummary(student.id, sessionId)
			if (!response.success) {
				throw new Error(response.error)
			}
			return response.data
		},
		enabled: open && !!student.id && activeTab === 'summary',
		staleTime: 2 * 60 * 1000, // 2 minutes
	})

	const handlePrint = useReactToPrint({
		content: () => printRef.current,
		documentTitle: `Marksheet-${student.name}-${student.roll}`,
		pageStyle: `
			@page {
				size: A4;
				margin: 1cm;
			}
			@media print {
				body { -webkit-print-color-adjust: exact; }
			}
		`
	})

	const handleDownload = () => {
		if (marksheetData) {
			handlePrint()
		}
	}

	const handleSend = () => {
		// TODO: Implement sending via email/SMS
		console.log('Send marksheet')
	}

	const getGradeBadgeVariant = (grade?: string) => {
		if (!grade) return 'secondary'
		if (grade.startsWith('A')) return 'default'
		if (grade.startsWith('B')) return 'secondary'
		if (grade.startsWith('C')) return 'outline'
		return 'destructive'
	}

	const groupedResults = marksheetData?.results.reduce((acc, result) => {
		const examType = result.examSchedule.exam.examType.name
		if (!acc[examType]) {
			acc[examType] = []
		}
		acc[examType].push(result)
		return acc
	}, {} as Record<string, typeof marksheetData.results>)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<GraduationCap className="h-6 w-6" />
							Student Marksheet
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={activeTab === 'marksheet' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setActiveTab('marksheet')}
							>
								<FileText className="h-4 w-4 mr-1" />
								Marksheet
							</Button>
							<Button
								variant={activeTab === 'summary' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setActiveTab('summary')}
							>
								<Award className="h-4 w-4 mr-1" />
								Summary
							</Button>
						</div>
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-auto">
					{/* Student Header */}
					<Card className="mb-6">
						<CardContent className="pt-6">
							<div className="flex items-center gap-4 mb-4">
								<Avatar className="h-16 w-16">
									<AvatarImage src={student.photo} />
									<AvatarFallback>
										{student.name.split(' ').map(n => n[0]).join('')}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h2 className="text-2xl font-bold">{student.name}</h2>
									<div className="flex items-center gap-4 text-muted-foreground">
										<span className="flex items-center gap-1">
											<User className="h-4 w-4" />
											Roll: {student.roll}
										</span>
										<span className="flex items-center gap-1">
											<BookOpen className="h-4 w-4" />
											{student.class?.name}{student.section ? ` - ${student.section.name}` : ''}
										</span>
										<span className="flex items-center gap-1">
											<Calendar className="h-4 w-4" />
											{student.session?.title || 'Current Session'}
										</span>
									</div>
								</div>
								<div className="flex gap-2">
									<Button onClick={handleDownload} variant="outline">
										<Download className="h-4 w-4 mr-1" />
										Download PDF
									</Button>
									<Button onClick={handleSend}>
										<Send className="h-4 w-4 mr-1" />
										Send to Parent
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Content based on active tab */}
					{activeTab === 'marksheet' && (
						<div className="space-y-6">
							{marksheetLoading ? (
								<div className="flex items-center justify-center py-12">
									<Loader2 className="h-8 w-8 animate-spin mr-2" />
									Loading marksheet data...
								</div>
							) : marksheetError ? (
								<div className="flex items-center justify-center py-12">
									<div className="text-center">
										<AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
										<h3 className="text-lg font-semibold mb-2">Error Loading Marksheet</h3>
										<p className="text-muted-foreground">
											{marksheetError.message || 'Failed to load marksheet data'}
										</p>
									</div>
								</div>
							) : !marksheetData?.results?.length ? (
								<div className="flex items-center justify-center py-12">
									<div className="text-center">
										<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<h3 className="text-lg font-semibold mb-2">No Results Available</h3>
										<p className="text-muted-foreground">
											No published exam results found for this student.
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-8">
									{Object.entries(groupedResults || {}).map(([examType, results]) => (
										<Card key={examType}>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<BookOpen className="h-5 w-5" />
													{examType}
													<Badge variant="outline" className="ml-2">
														{results.length} subjects
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="border rounded-lg overflow-hidden">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Subject</TableHead>
																<TableHead className="text-center">Components</TableHead>
																<TableHead className="text-center">Marks</TableHead>
																<TableHead className="text-center">Percentage</TableHead>
																<TableHead className="text-center">Grade</TableHead>
																<TableHead className="text-center">Status</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{results.map((result) => (
																<TableRow key={result.id}>
																	<TableCell>
																		<div>
																			<p className="font-medium">{result.examSchedule.subject.name}</p>
																			<p className="text-sm text-muted-foreground">
																				{result.examSchedule.subject.code}
																			</p>
																			<p className="text-xs text-muted-foreground">
																				{result.examSchedule.date}
																			</p>
																		</div>
																	</TableCell>
																	
																	<TableCell className="text-center">
																		{result.isAbsent ? (
																			<Badge variant="destructive">Absent</Badge>
																		) : (
																			<div className="space-y-1">
																				{result.componentResults.map((cr, idx) => (
																					<div key={idx} className="text-xs">
																						<span className="font-medium">{cr.examComponent.name}:</span>{' '}
																						{cr.isAbsent ? 'Absent' : `${cr.obtainedMarks}/${cr.examComponent.maxMarks}`}
																					</div>
																				))}
																			</div>
																		)}
																	</TableCell>

																	<TableCell className="text-center">
																		{result.isAbsent ? (
																			<span className="text-muted-foreground">-</span>
																		) : (
																			<p className="font-medium">
																				{result.obtainedMarks}/{result.totalMarks}
																			</p>
																		)}
																	</TableCell>

																	<TableCell className="text-center">
																		{result.isAbsent ? (
																			<span className="text-muted-foreground">-</span>
																		) : (
																			<p className="font-medium">
																				{result.percentage.toFixed(1)}%
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
																		{result.isAbsent ? (
																			<Badge variant="destructive">Absent</Badge>
																		) : result.percentage >= 80 ? (
																			<div className="flex items-center justify-center text-green-600">
																				<TrendingUp className="h-4 w-4 mr-1" />
																				Excellent
																			</div>
																		) : result.percentage >= 60 ? (
																			<div className="flex items-center justify-center text-blue-600">
																				Good
																			</div>
																		) : result.percentage >= 40 ? (
																			<div className="flex items-center justify-center text-orange-600">
																				Average
																			</div>
																		) : (
																			<div className="flex items-center justify-center text-red-600">
																				<TrendingDown className="h-4 w-4 mr-1" />
																				Needs Improvement
																			</div>
																		)}
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</div>
					)}

					{activeTab === 'summary' && (
						<div className="space-y-6">
							{summaryLoading ? (
								<div className="flex items-center justify-center py-12">
									<Loader2 className="h-8 w-8 animate-spin mr-2" />
									Loading summary data...
								</div>
							) : summaryError ? (
								<div className="flex items-center justify-center py-12">
									<div className="text-center">
										<AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
										<h3 className="text-lg font-semibold mb-2">Error Loading Summary</h3>
										<p className="text-muted-foreground">
											{summaryError.message || 'Failed to load summary data'}
										</p>
									</div>
								</div>
							) : summaryData && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Overall Performance */}
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Award className="h-5 w-5" />
												Overall Performance
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="text-center p-4 bg-muted rounded-lg">
													<p className="text-2xl font-bold text-primary">
														{summaryData.totalExams}
													</p>
													<p className="text-sm text-muted-foreground">Total Exams</p>
												</div>
												<div className="text-center p-4 bg-muted rounded-lg">
													<p className="text-2xl font-bold text-primary">
														{summaryData.averagePercentage}%
													</p>
													<p className="text-sm text-muted-foreground">Average</p>
												</div>
												<div className="text-center p-4 bg-muted rounded-lg">
													<p className="text-2xl font-bold text-primary">
														{summaryData.obtainedMarks}
													</p>
													<p className="text-sm text-muted-foreground">Obtained</p>
												</div>
												<div className="text-center p-4 bg-muted rounded-lg">
													<p className="text-2xl font-bold text-primary">
														{summaryData.totalMarks}
													</p>
													<p className="text-sm text-muted-foreground">Total Marks</p>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Grade Distribution */}
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<TrendingUp className="h-5 w-5" />
												Grade Distribution
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-3">
												{Object.entries(summaryData.gradeDistribution).map(([grade, count]) => (
													<div key={grade} className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<Badge variant={getGradeBadgeVariant(grade)}>
																{grade}
															</Badge>
														</div>
														<span className="font-medium">{count} subjects</span>
													</div>
												))}
												{Object.keys(summaryData.gradeDistribution).length === 0 && (
													<p className="text-muted-foreground text-center py-4">
														No grade data available
													</p>
												)}
											</div>
										</CardContent>
									</Card>

									{/* Subject Performance */}
									<Card className="md:col-span-2">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<BookOpen className="h-5 w-5" />
												Subject Performance
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="border rounded-lg overflow-hidden">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Subject</TableHead>
															<TableHead className="text-center">Exams</TableHead>
															<TableHead className="text-center">Marks</TableHead>
															<TableHead className="text-center">Average %</TableHead>
															<TableHead className="text-center">Performance</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{Object.entries(summaryData.subjectPerformance).map(([subject, data]) => (
															<TableRow key={subject}>
																<TableCell className="font-medium">{subject}</TableCell>
																<TableCell className="text-center">{data.count}</TableCell>
																<TableCell className="text-center">
																	{data.obtained}/{data.total}
																</TableCell>
																<TableCell className="text-center">
																	{data.percentage.toFixed(1)}%
																</TableCell>
																<TableCell className="text-center">
																	{data.percentage >= 80 ? (
																		<div className="flex items-center justify-center text-green-600">
																			<TrendingUp className="h-4 w-4 mr-1" />
																			Excellent
																		</div>
																	) : data.percentage >= 60 ? (
																		<div className="flex items-center justify-center text-blue-600">
																			Good
																		</div>
																	) : data.percentage >= 40 ? (
																		<div className="flex items-center justify-center text-orange-600">
																			Average
																		</div>
																	) : (
																		<div className="flex items-center justify-center text-red-600">
																			<TrendingDown className="h-4 w-4 mr-1" />
																			Needs Improvement
																		</div>
																	)}
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Hidden PDF Component for Printing */}
				<div className="hidden">
					{marksheetData && (
						<MarksheetPDF
							ref={printRef}
							data={marksheetData}
							tenantInfo={{
								name: 'School Management System', // TODO: Get from tenant context
								logo: '/placeholder-logo.png', // TODO: Get from tenant context
								address: 'School Address Here', // TODO: Get from tenant context
							}}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}