'use client'

import {
	FormCheckbox,
	FormProvider,
	FormSelect,
	FormSubmit,
} from '@/components/school-form'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle, FileCheck, FileX, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	getExamResults,
	publishResults,
	unpublishResults,
} from '../api/resultPublication.action'
import {
	resultPublicationSchema,
	type ResultPublicationFormData,
} from '../types'

interface ResultPublicationFormProps {
	onSuccess?: () => void
	item?: any
}

export function ResultPublicationForm({
	onSuccess,
	item,
}: ResultPublicationFormProps) {
	const { toast } = useToast()
	const [loading, setLoading] = useState(false)
	const [examSchedules, setExamSchedules] = useState<any[]>([])
	const [selectedExamSchedule, setSelectedExamSchedule] = useState<any>(null)
	const [results, setResults] = useState<any[]>([])
	const [statistics, setStatistics] = useState<any>(null)

	const isUpdate = !!item

	const defaultValues: ResultPublicationFormData = {
		examScheduleId: item?.examScheduleId || '',
		notifyStudents: item?.notifyStudents || false,
		notifyParents: item?.notifyParents || false,
	}

	// Load exam schedules that have results but are not published
	useEffect(() => {
		loadUnpublishedExamSchedules()
	}, [])

	// Load results when exam schedule is selected
	useEffect(() => {
		if (selectedExamSchedule?.id) {
			loadExamResults(selectedExamSchedule.id)
		}
	}, [selectedExamSchedule])

	const loadUnpublishedExamSchedules = async () => {
		try {
			// This would need to be implemented as a server action
			// For now, we'll use a placeholder
			const mockSchedules: any[] = []
			setExamSchedules(mockSchedules)
		} catch (error) {
			console.error('Error loading exam schedules:', error)
		}
	}

	const loadExamResults = async (examScheduleId: string) => {
		try {
			setLoading(true)
			const result = await getExamResults(examScheduleId, true)

			if (result.success) {
				setResults(result.data || [])
				calculateStatistics(result.data || [])
			} else {
				toast({
					title: 'Error',
					description: result.error,
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load exam results',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const calculateStatistics = (results: any[]) => {
		const totalStudents = results.length
		const absentStudents = results.filter(r => r.isAbsent).length
		const presentStudents = totalStudents - absentStudents

		const presentResults = results.filter(r => !r.isAbsent)
		const averagePercentage =
			presentResults.length > 0
				? presentResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
					presentResults.length
				: 0

		const passRate =
			presentResults.length > 0
				? (presentResults.filter(r => (r.percentage || 0) >= 40).length /
						presentResults.length) *
					100
				: 0

		setStatistics({
			totalStudents,
			absentStudents,
			presentStudents,
			averagePercentage: Math.round(averagePercentage * 100) / 100,
			passRate: Math.round(passRate * 100) / 100,
		})
	}

	const handlePublish = async (data: ResultPublicationFormData) => {
		try {
			setLoading(true)
			const result = await publishResults(data)

			if (result.success) {
				toast({
					title: 'Success',
					description: 'Results published successfully',
				})
				onSuccess?.()
			} else {
				toast({
					title: 'Error',
					description: result.error,
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to publish results',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleUnpublish = async () => {
		if (!selectedExamSchedule?.id) return

		try {
			setLoading(true)
			const result = await unpublishResults(selectedExamSchedule.id)

			if (result.success) {
				toast({
					title: 'Success',
					description: 'Results unpublished successfully',
				})
				onSuccess?.()
			} else {
				toast({
					title: 'Error',
					description: result.error,
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to unpublish results',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			<FormProvider
				schema={resultPublicationSchema as any}
				onSubmit={handlePublish}
				defaultValues={defaultValues}
			>
				<div className="space-y-6">
					{/* Exam Schedule Selection */}
					{!isUpdate && (
						<Card>
							<CardHeader>
								<CardTitle>Select Exam Schedule</CardTitle>
							</CardHeader>
							<CardContent>
								<FormSelect
									name="examScheduleId"
									label="Exam Schedule"
									placeholder="Select exam schedule with results..."
									options={examSchedules.map(schedule => ({
										value: schedule.id,
										label: `${schedule.exam.title} - ${schedule.subject.name} (${schedule.class.name})`,
									}))}
									onValueChange={value => {
										const schedule = examSchedules.find(s => s.id === value)
										setSelectedExamSchedule(schedule)
									}}
									required
								/>
							</CardContent>
						</Card>
					)}

					{/* Results Overview */}
					{selectedExamSchedule && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileCheck className="h-5 w-5" />
									Results Overview
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Exam Info */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<div>
											<div className="text-sm text-muted-foreground">Exam</div>
											<div className="font-medium">
												{selectedExamSchedule.exam?.title}
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedExamSchedule.exam?.examType?.name}
											</div>
										</div>
										<div>
											<div className="text-sm text-muted-foreground">
												Subject
											</div>
											<div className="font-medium">
												{selectedExamSchedule.subject?.name}
											</div>
										</div>
										<div>
											<div className="text-sm text-muted-foreground">
												Class & Section
											</div>
											<div className="font-medium">
												{selectedExamSchedule.class?.name}
												{selectedExamSchedule.section &&
													` - ${selectedExamSchedule.section.name}`}
											</div>
										</div>
										<div>
											<div className="text-sm text-muted-foreground">
												Session
											</div>
											<div className="font-medium">
												{selectedExamSchedule.exam?.session?.title}
											</div>
										</div>
									</div>

									<Separator />

									{/* Statistics */}
									{statistics && (
										<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
											<div className="text-center">
												<div className="text-2xl font-bold flex items-center justify-center gap-1">
													<Users className="h-5 w-5" />
													{statistics.totalStudents}
												</div>
												<div className="text-sm text-muted-foreground">
													Total Students
												</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-green-600">
													{statistics.presentStudents}
												</div>
												<div className="text-sm text-muted-foreground">
													Present
												</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-red-600">
													{statistics.absentStudents}
												</div>
												<div className="text-sm text-muted-foreground">
													Absent
												</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-blue-600">
													{statistics.averagePercentage}%
												</div>
												<div className="text-sm text-muted-foreground">
													Class Average
												</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-purple-600">
													{statistics.passRate}%
												</div>
												<div className="text-sm text-muted-foreground">
													Pass Rate
												</div>
											</div>
										</div>
									)}

									{/* Publication Status */}
									<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
										<div className="flex items-center gap-2">
											{item?.isPublished ? (
												<>
													<FileCheck className="h-5 w-5 text-green-600" />
													<div>
														<div className="font-medium">Results Published</div>
														<div className="text-sm text-muted-foreground">
															Published on{' '}
															{item.publishedAt
																? new Date(item.publishedAt).toLocaleString()
																: 'Unknown'}
														</div>
													</div>
												</>
											) : (
												<>
													<FileX className="h-5 w-5 text-orange-600" />
													<div>
														<div className="font-medium">
															Results Not Published
														</div>
														<div className="text-sm text-muted-foreground">
															Results are in draft mode
														</div>
													</div>
												</>
											)}
										</div>

										{item?.isPublished ? (
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="outline"
														className="text-red-600 border-red-600"
													>
														<FileX className="h-4 w-4 mr-2" />
														Unpublish
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Unpublish Results
														</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to unpublish these results?
															This will hide them from students and parents.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={handleUnpublish}
															className="bg-red-600 hover:bg-red-700"
														>
															Unpublish Results
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										) : (
											<Badge variant="secondary">Ready to Publish</Badge>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Publication Options */}
					{selectedExamSchedule && !item?.isPublished && (
						<Card>
							<CardHeader>
								<CardTitle>Publication Options</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormCheckbox
									name="notifyStudents"
									label="Notify Students"
									description="Send notification to students when results are published"
								/>

								<FormCheckbox
									name="notifyParents"
									label="Notify Parents"
									description="Send notification to parents when results are published"
								/>

								<div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
									<AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
									<div className="text-sm">
										<div className="font-medium text-yellow-800">Important</div>
										<div className="text-yellow-700">
											Once published, results will be visible to students and
											parents. Make sure all results are accurate before
											publishing.
										</div>
									</div>
								</div>

								<div className="flex gap-2 pt-4">
									<FormSubmit
										className="bg-green-600 hover:bg-green-700"
										disabled={loading || !selectedExamSchedule}
									>
										{loading ? (
											'Publishing...'
										) : (
											<>
												<FileCheck className="h-4 w-4 mr-2" />
												Publish Results
											</>
										)}
									</FormSubmit>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</FormProvider>
		</div>
	)
}
