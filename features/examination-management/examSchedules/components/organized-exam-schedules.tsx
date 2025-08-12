'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
	Calendar, 
	Clock, 
	MapPin, 
	Users, 
	CheckCircle, 
	Circle, 
	AlertCircle, 
	Play, 
	Square, 
	XCircle,
	ChevronDown,
	ChevronRight,
	GraduationCap,
	BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
	getOrganizedExamSchedulesAction,
	markExamCompleteAction,
	startExamAction,
	cancelExamAction,
	getExamCompletionStatsAction
} from '../api/exam-management.action'
import type { ExamWithSchedules, ExamScheduleDetails } from '../services/exam-management.service'

interface OrganizedExamSchedulesProps {
	className?: string
}

export default function OrganizedExamSchedules({ className }: OrganizedExamSchedulesProps) {
	const [exams, setExams] = useState<ExamWithSchedules[]>([])
	const [stats, setStats] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState<string | null>(null)
	const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set())
	const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())

	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		setLoading(true)
		try {
			const [examsResponse, statsResponse] = await Promise.all([
				getOrganizedExamSchedulesAction(),
				getExamCompletionStatsAction()
			])

			if (examsResponse.success) {
				setExams(examsResponse.data)
			} else {
				toast.error('Failed to load exams: ' + examsResponse.error)
			}

			if (statsResponse.success) {
				setStats(statsResponse.data)
			}
		} catch (error) {
			toast.error('Failed to load exam data')
		} finally {
			setLoading(false)
		}
	}

	const handleExamAction = async (examId: string, action: 'start' | 'complete' | 'cancel') => {
		setActionLoading(examId + '-' + action)
		try {
			let response
			switch (action) {
				case 'start':
					response = await startExamAction(examId)
					break
				case 'complete':
					response = await markExamCompleteAction(examId)
					break
				case 'cancel':
					response = await cancelExamAction(examId)
					break
			}

			if (response.success) {
				toast.success(response.data.message)
				await loadData() // Refresh data
			} else {
				toast.error(response.error)
			}
		} catch (error) {
			toast.error('Action failed')
		} finally {
			setActionLoading(null)
		}
	}

	const toggleExamExpansion = (examId: string) => {
		const newExpanded = new Set(expandedExams)
		if (newExpanded.has(examId)) {
			newExpanded.delete(examId)
		} else {
			newExpanded.add(examId)
		}
		setExpandedExams(newExpanded)
	}

	const toggleClassExpansion = (classKey: string) => {
		const newExpanded = new Set(expandedClasses)
		if (newExpanded.has(classKey)) {
			newExpanded.delete(classKey)
		} else {
			newExpanded.add(classKey)
		}
		setExpandedClasses(newExpanded)
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'SCHEDULED':
				return <Circle className="h-4 w-4" />
			case 'ONGOING':
				return <Play className="h-4 w-4" />
			case 'COMPLETED':
				return <CheckCircle className="h-4 w-4" />
			case 'CANCELLED':
				return <XCircle className="h-4 w-4" />
			default:
				return <Circle className="h-4 w-4" />
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'SCHEDULED':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'ONGOING':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'COMPLETED':
				return 'bg-green-100 text-green-800 border-green-200'
			case 'CANCELLED':
				return 'bg-red-100 text-red-800 border-red-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const formatTime = (timeInt: number) => {
		const hours = Math.floor(timeInt / 100)
		const minutes = timeInt % 100
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				<span className="ml-2">Loading exam schedules...</span>
			</div>
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			{/* Stats Overview */}
			{stats && (
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold">{stats.total}</div>
							<p className="text-sm text-muted-foreground">Total Exams</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
							<p className="text-sm text-muted-foreground">Scheduled</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-yellow-600">{stats.ongoing}</div>
							<p className="text-sm text-muted-foreground">Ongoing</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-green-600">{stats.completed}</div>
							<p className="text-sm text-muted-foreground">Completed</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
							<p className="text-sm text-muted-foreground">Cancelled</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Exams List */}
			<div className="space-y-4">
				{exams.length === 0 ? (
					<Card>
						<CardContent className="pt-6 text-center py-8">
							<GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
							<p className="text-gray-500">No exams found</p>
						</CardContent>
					</Card>
				) : (
					exams.map((exam) => (
						<Card key={exam.id} className="overflow-hidden">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Collapsible
											open={expandedExams.has(exam.id)}
											onOpenChange={() => toggleExamExpansion(exam.id)}
										>
											<CollapsibleTrigger className="p-1 hover:bg-gray-100 rounded">
												{expandedExams.has(exam.id) ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</CollapsibleTrigger>
										</Collapsible>
										<div>
											<CardTitle className="text-lg flex items-center gap-2">
												{getStatusIcon(exam.status)}
												{exam.title}
											</CardTitle>
											<div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
												<span>{exam.examType.name}</span>
												<span>•</span>
												<span>{exam.session.title}</span>
												<span>•</span>
												<span>{format(new Date(exam.startDate), 'MMM dd')} - {format(new Date(exam.endDate), 'MMM dd, yyyy')}</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge variant="outline" className={getStatusColor(exam.status)}>
											{exam.status}
										</Badge>
										<div className="text-sm text-muted-foreground">
											{exam.completedSchedules}/{exam.totalSchedules} schedules completed
										</div>
										{/* Action Buttons */}
										{exam.status === 'SCHEDULED' && (
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleExamAction(exam.id, 'start')}
												disabled={actionLoading === exam.id + '-start'}
											>
												{actionLoading === exam.id + '-start' ? 'Starting...' : 'Start Exam'}
											</Button>
										)}
										{exam.canMarkComplete && (
											<Button
												size="sm"
												variant="default"
												onClick={() => handleExamAction(exam.id, 'complete')}
												disabled={actionLoading === exam.id + '-complete'}
											>
												{actionLoading === exam.id + '-complete' ? 'Completing...' : 'Mark Complete'}
											</Button>
										)}
										{exam.status !== 'COMPLETED' && exam.status !== 'CANCELLED' && (
											<Button
												size="sm"
												variant="destructive"
												onClick={() => handleExamAction(exam.id, 'cancel')}
												disabled={actionLoading === exam.id + '-cancel'}
											>
												{actionLoading === exam.id + '-cancel' ? 'Cancelling...' : 'Cancel'}
											</Button>
										)}
									</div>
								</div>
							</CardHeader>

							<Collapsible
								open={expandedExams.has(exam.id)}
								onOpenChange={() => toggleExamExpansion(exam.id)}
							>
								<CollapsibleContent>
									<CardContent className="pt-0">
										{exam.schedulesByClass.map((classGroup) => (
											<div key={classGroup.classId} className="mb-6 last:mb-0">
												<div className="flex items-center gap-2 mb-3">
													<Collapsible
														open={expandedClasses.has(classGroup.classId)}
														onOpenChange={() => toggleClassExpansion(classGroup.classId)}
													>
														<CollapsibleTrigger className="p-1 hover:bg-gray-100 rounded">
															{expandedClasses.has(classGroup.classId) ? (
																<ChevronDown className="h-3 w-3" />
															) : (
																<ChevronRight className="h-3 w-3" />
															)}
														</CollapsibleTrigger>
													</Collapsible>
													<h3 className="font-medium text-base flex items-center gap-2">
														<BookOpen className="h-4 w-4" />
														{classGroup.className}
													</h3>
												</div>

												<Collapsible
													open={expandedClasses.has(classGroup.classId)}
													onOpenChange={() => toggleClassExpansion(classGroup.classId)}
												>
													<CollapsibleContent>
														<div className="ml-6 space-y-4">
															{classGroup.sections.map((sectionGroup, sectionIndex) => (
																<div key={sectionGroup.sectionId || 'no-section'}>
																	{sectionGroup.sectionName && (
																		<h4 className="font-medium text-sm text-muted-foreground mb-2">
																			Section: {sectionGroup.sectionName}
																		</h4>
																	)}
																	<div className="grid gap-3">
																		{sectionGroup.schedules.map((schedule) => (
																			<ScheduleCard 
																				key={schedule.id} 
																				schedule={schedule} 
																			/>
																		))}
																	</div>
																</div>
															))}
														</div>
													</CollapsibleContent>
												</Collapsible>

												{classGroup.classId !== exam.schedulesByClass[exam.schedulesByClass.length - 1]?.classId && (
													<Separator className="mt-4" />
												)}
											</div>
										))}
									</CardContent>
								</CollapsibleContent>
							</Collapsible>
						</Card>
					))
				)}
			</div>
		</div>
	)
}

function ScheduleCard({ schedule }: { schedule: ExamScheduleDetails }) {
	const formatTime = (timeInt: number) => {
		const hours = Math.floor(timeInt / 100)
		const minutes = timeInt % 100
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
	}

	return (
		<Card className="border-l-4 border-l-blue-500 bg-gray-50/50">
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-4">
							<h4 className="font-medium">{schedule.subject.name}</h4>
							{schedule.hasResults ? (
								<Badge variant="default" className="bg-green-100 text-green-800">
									<CheckCircle className="h-3 w-3 mr-1" />
									Results ({schedule.resultCount}/{schedule.studentCount})
								</Badge>
							) : (
								<Badge variant="outline">
									<Circle className="h-3 w-3 mr-1" />
									No Results
								</Badge>
							)}
						</div>
						
						<div className="flex items-center gap-6 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								{format(new Date(schedule.date), 'MMM dd, yyyy')}
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
							</div>
							{schedule.room && (
								<div className="flex items-center gap-1">
									<MapPin className="h-4 w-4" />
									{schedule.room}
								</div>
							)}
							<div className="flex items-center gap-1">
								<Users className="h-4 w-4" />
								{schedule.studentCount} students
							</div>
						</div>

						{schedule.components.length > 0 && (
							<div className="flex items-center gap-2 text-sm">
								<span className="text-muted-foreground">Components:</span>
								{schedule.components.map((component, index) => (
									<Badge key={index} variant="secondary" className="text-xs">
										{component.name} ({component.maxMarks}m)
									</Badge>
								))}
							</div>
						)}

						{schedule.invigilators.length > 0 && (
							<div className="flex items-center gap-2 text-sm">
								<span className="text-muted-foreground">Invigilators:</span>
								<span>{schedule.invigilators.map(inv => inv.name).join(', ')}</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}