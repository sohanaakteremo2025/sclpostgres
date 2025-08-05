'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
	User, 
	BookOpen, 
	Calendar, 
	Trophy,
	FileText,
	Download,
	Send,
	Edit,
	CheckCircle,
	XCircle,
	Clock
} from 'lucide-react'

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
}

interface ResultDetailsDialogProps {
	result: ExamResult | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ResultDetailsDialog({ result, open, onOpenChange }: ResultDetailsDialogProps) {
	if (!result) return null

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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						Exam Result Details
					</DialogTitle>
					<DialogDescription>
						Detailed breakdown of {result.student.name}'s performance
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Student & Exam Info */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Student Information */}
						<div className="space-y-4">
							<h3 className="font-semibold flex items-center gap-2">
								<User className="h-4 w-4" />
								Student Information
							</h3>
							<div className="flex items-center gap-4 p-4 border rounded-lg">
								<Avatar className="h-16 w-16">
									<AvatarImage src={result.student.photo} />
									<AvatarFallback className="text-lg">
										{result.student.name.split(' ').map(n => n[0]).join('')}
									</AvatarFallback>
								</Avatar>
								<div>
									<h4 className="font-semibold text-lg">{result.student.name}</h4>
									<p className="text-muted-foreground">Roll: {result.student.roll}</p>
									<p className="text-sm text-muted-foreground">
										{result.examSchedule.class.name}
										{result.examSchedule.section && ` - Section ${result.examSchedule.section.name}`}
									</p>
								</div>
							</div>
						</div>

						{/* Exam Information */}
						<div className="space-y-4">
							<h3 className="font-semibold flex items-center gap-2">
								<BookOpen className="h-4 w-4" />
								Exam Information
							</h3>
							<div className="p-4 border rounded-lg space-y-3">
								<div>
									<h4 className="font-semibold">{result.examSchedule.exam.title}</h4>
									<p className="text-muted-foreground">{result.examSchedule.subject.name}</p>
								</div>
								<div className="flex items-center gap-4 text-sm">
									<Badge variant="outline">
										{result.examSchedule.exam.examType.name}
									</Badge>
									<div className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{result.examSchedule.date}
									</div>
								</div>
								<div className="flex items-center gap-2">
									{result.isPublished ? (
										<Badge variant="default" className="bg-green-100 text-green-800">
											<CheckCircle className="h-3 w-3 mr-1" />
											Published
										</Badge>
									) : (
										<Badge variant="secondary">
											<Clock className="h-3 w-3 mr-1" />
											Pending Publication
										</Badge>
									)}
								</div>
							</div>
						</div>
					</div>

					<Separator />

					{/* Overall Performance */}
					<div className="space-y-4">
						<h3 className="font-semibold flex items-center gap-2">
							<Trophy className="h-4 w-4" />
							Overall Performance
						</h3>
						
						{result.isAbsent ? (
							<div className="text-center py-8">
								<XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
								<h4 className="text-lg font-semibold text-red-600 mb-2">Student was Absent</h4>
								<p className="text-muted-foreground">No marks recorded for this examination</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center p-6 border rounded-lg">
									<div className="text-3xl font-bold mb-2">
										{result.obtainedMarks}/{result.totalMarks}
									</div>
									<p className="text-muted-foreground">Total Marks</p>
								</div>
								
								<div className="text-center p-6 border rounded-lg">
									<div className={`text-3xl font-bold mb-2 ${getPerformanceColor(result.percentage)}`}>
										{result.percentage?.toFixed(1)}%
									</div>
									<p className="text-muted-foreground">Percentage</p>
									<div className="mt-2">
										<Progress value={result.percentage} className="h-2" />
									</div>
								</div>
								
								<div className="text-center p-6 border rounded-lg">
									<div className="mb-2">
										{result.grade ? (
											<Badge 
												variant={getGradeBadgeVariant(result.grade)} 
												className="text-xl px-4 py-2"
											>
												{result.grade}
											</Badge>
										) : (
											<span className="text-2xl text-muted-foreground">N/A</span>
										)}
									</div>
									<p className="text-muted-foreground">Grade</p>
								</div>
							</div>
						)}
					</div>

					{/* Component-wise Breakdown */}
					{!result.isAbsent && result.componentResults.length > 0 && (
						<>
							<Separator />
							<div className="space-y-4">
								<h3 className="font-semibold flex items-center gap-2">
									<FileText className="h-4 w-4" />
									Component-wise Breakdown
								</h3>
								
								<div className="space-y-3">
									{result.componentResults.map((component) => {
										const percentage = (component.obtainedMarks / component.examComponent.maxMarks) * 100
										return (
											<div key={component.id} className="p-4 border rounded-lg">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-medium">{component.examComponent.name}</h4>
													<Badge variant="outline">
														{component.obtainedMarks}/{component.examComponent.maxMarks}
													</Badge>
												</div>
												
												<div className="space-y-2">
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">Performance</span>
														<span className={`font-medium ${getPerformanceColor(percentage)}`}>
															{percentage.toFixed(1)}%
														</span>
													</div>
													<Progress value={percentage} className="h-2" />
													
													{component.remarks && (
														<div className="text-sm">
															<span className="text-muted-foreground">Remarks: </span>
															<span>{component.remarks}</span>
														</div>
													)}
													
													{component.isAbsent && (
														<Badge variant="destructive" className="text-xs">
															Absent for this component
														</Badge>
													)}
												</div>
											</div>
										)
									})}
								</div>
							</div>
						</>
					)}

					{/* Action Buttons */}
					<Separator />
					<div className="flex flex-wrap gap-2 justify-end">
						<Button variant="outline" size="sm">
							<Edit className="h-4 w-4 mr-2" />
							Edit Result
						</Button>
						<Button variant="outline" size="sm">
							<Download className="h-4 w-4 mr-2" />
							Download Report
						</Button>
						<Button variant="outline" size="sm">
							<Send className="h-4 w-4 mr-2" />
							Send to Student
						</Button>
						{!result.isPublished && (
							<Button size="sm">
								<CheckCircle className="h-4 w-4 mr-2" />
								Publish Result
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}