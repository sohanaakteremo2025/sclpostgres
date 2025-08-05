'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { Save, Plus, Trash2, User, UserCheck, UserX } from 'lucide-react'
import { enterBulkResults } from '../api/resultPublication.action'

const componentResultSchema = z.object({
	examComponentId: z.string(),
	obtainedMarks: z.number().min(0),
	isAbsent: z.boolean().default(false),
	remarks: z.string().optional(),
})

const studentResultSchema = z.object({
	studentId: z.string(),
	componentResults: z.array(componentResultSchema),
})

const bulkResultSchema = z.object({
	examScheduleId: z.string(),
	results: z.array(studentResultSchema),
})

type BulkResultForm = z.infer<typeof bulkResultSchema>
type StudentResult = z.infer<typeof studentResultSchema>
type ComponentResult = z.infer<typeof componentResultSchema>

interface ExamScheduleData {
	id: string
	exam: {
		title: string
		examType: { name: string }
	}
	subject: { name: string }
	class: { name: string }
	section: { name: string } | null
	components: Array<{
		id: string
		name: string
		maxMarks: number
		order: number
	}>
}

interface Student {
	id: string
	name: string
	roll: string
	photo?: string
}

interface ResultEntryFormProps {
	examSchedule: ExamScheduleData
	students: Student[]
	existingResults?: Array<{
		studentId: string
		componentResults: Array<{
			examComponentId: string
			obtainedMarks: number
			isAbsent: boolean
			remarks?: string
		}>
	}>
	onSuccess?: () => void
}

export function ResultEntryForm({
	examSchedule,
	students,
	existingResults = [],
	onSuccess,
}: ResultEntryFormProps) {
	const [loading, setLoading] = useState(false)
	const [selectedStudents, setSelectedStudents] = useState<string[]>([])
	const [bulkMode, setBulkMode] = useState(false)

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<BulkResultForm>({
		resolver: zodResolver(bulkResultSchema),
		defaultValues: {
			examScheduleId: examSchedule.id,
			results: students.map(student => {
				const existing = existingResults.find(r => r.studentId === student.id)
				return {
					studentId: student.id,
					componentResults: examSchedule.components.map(component => {
						const existingComponent = existing?.componentResults.find(
							cr => cr.examComponentId === component.id,
						)
						return {
							examComponentId: component.id,
							obtainedMarks: existingComponent?.obtainedMarks || 0,
							isAbsent: existingComponent?.isAbsent || false,
							remarks: existingComponent?.remarks || '',
						}
					}),
				}
			}),
		},
	})

	const watchedResults = watch('results')

	const onSubmit = async (data: BulkResultForm) => {
		setLoading(true)
		try {
			const result = await enterBulkResults(data)

			if (result.success) {
				toast({
					title: 'Success',
					description: 'Results saved successfully',
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
				description: 'Failed to save results',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const toggleStudentSelection = (studentId: string) => {
		setSelectedStudents(prev =>
			prev.includes(studentId)
				? prev.filter(id => id !== studentId)
				: [...prev, studentId],
		)
	}

	const selectAllStudents = () => {
		setSelectedStudents(students.map(s => s.id))
	}

	const clearSelection = () => {
		setSelectedStudents([])
	}

	const markSelectedAsAbsent = () => {
		const currentResults = getValues('results')
		const updatedResults = currentResults.map(result => {
			if (selectedStudents.includes(result.studentId)) {
				return {
					...result,
					componentResults: result.componentResults.map(cr => ({
						...cr,
						isAbsent: true,
						obtainedMarks: 0,
					})),
				}
			}
			return result
		})
		setValue('results', updatedResults)
	}

	const markSelectedAsPresent = () => {
		const currentResults = getValues('results')
		const updatedResults = currentResults.map(result => {
			if (selectedStudents.includes(result.studentId)) {
				return {
					...result,
					componentResults: result.componentResults.map(cr => ({
						...cr,
						isAbsent: false,
					})),
				}
			}
			return result
		})
		setValue('results', updatedResults)
	}

	const calculateTotalMarks = (studentIndex: number) => {
		const studentResult = watchedResults[studentIndex]
		if (!studentResult) return { obtained: 0, total: 0, percentage: 0 }

		const obtained = studentResult.componentResults.reduce(
			(sum, cr) => sum + (cr.isAbsent ? 0 : cr.obtainedMarks),
			0,
		)
		const total = examSchedule.components.reduce((sum, comp) => sum + comp.maxMarks, 0)
		const percentage = total > 0 ? (obtained / total) * 100 : 0

		return { obtained, total, percentage }
	}

	const isStudentAbsent = (studentIndex: number) => {
		const studentResult = watchedResults[studentIndex]
		return studentResult?.componentResults.some(cr => cr.isAbsent) || false
	}

	return (
		<div className="space-y-6">
			{/* Exam Info */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Exam Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div>
							<Label className="text-sm text-muted-foreground">Exam</Label>
							<div className="font-medium">{examSchedule.exam.title}</div>
							<div className="text-sm text-muted-foreground">
								{examSchedule.exam.examType.name}
							</div>
						</div>
						<div>
							<Label className="text-sm text-muted-foreground">Subject</Label>
							<div className="font-medium">{examSchedule.subject.name}</div>
						</div>
						<div>
							<Label className="text-sm text-muted-foreground">Class & Section</Label>
							<div className="font-medium">
								{examSchedule.class.name}
								{examSchedule.section && ` - ${examSchedule.section.name}`}
							</div>
						</div>
						<div>
							<Label className="text-sm text-muted-foreground">Total Students</Label>
							<div className="font-medium">{students.length}</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Components Info */}
			<Card>
				<CardHeader>
					<CardTitle>Exam Components</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{examSchedule.components
							.sort((a, b) => a.order - b.order)
							.map(component => (
								<div key={component.id} className="text-center">
									<Badge variant="outline" className="w-full py-2">
										{component.name}
									</Badge>
									<div className="text-sm text-muted-foreground mt-1">
										Max: {component.maxMarks}
									</div>
								</div>
							))}
					</div>
				</CardContent>
			</Card>

			{/* Bulk Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>Bulk Actions</span>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							{selectedStudents.length > 0 && (
								<span>{selectedStudents.length} selected</span>
							)}
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onClick={selectAllStudents}>
							<UserCheck className="h-4 w-4 mr-1" />
							Select All
						</Button>
						<Button variant="outline" size="sm" onClick={clearSelection}>
							<UserX className="h-4 w-4 mr-1" />
							Clear Selection
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={markSelectedAsAbsent}
							disabled={selectedStudents.length === 0}
						>
							Mark as Absent
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={markSelectedAsPresent}
							disabled={selectedStudents.length === 0}
						>
							Mark as Present
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Results Entry Form */}
			<form onSubmit={handleSubmit(onSubmit)}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Enter Results</span>
							<Button type="submit" disabled={loading}>
								{loading ? (
									'Saving...'
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Save Results
									</>
								)}
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-12">
											<Checkbox
												checked={selectedStudents.length === students.length}
												onCheckedChange={checked => {
													if (checked) {
														selectAllStudents()
													} else {
														clearSelection()
													}
												}}
											/>
										</TableHead>
										<TableHead>Student</TableHead>
										{examSchedule.components
											.sort((a, b) => a.order - b.order)
											.map(component => (
												<TableHead key={component.id} className="text-center">
													{component.name}
													<div className="text-xs text-muted-foreground">
														Max: {component.maxMarks}
													</div>
												</TableHead>
											))}
										<TableHead>Total</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Remarks</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{students.map((student, studentIndex) => {
										const marks = calculateTotalMarks(studentIndex)
										const isAbsent = isStudentAbsent(studentIndex)

										return (
											<TableRow key={student.id}>
												<TableCell>
													<Checkbox
														checked={selectedStudents.includes(student.id)}
														onCheckedChange={() => toggleStudentSelection(student.id)}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{student.photo && (
															<img
																src={student.photo}
																alt={student.name}
																className="w-8 h-8 rounded-full object-cover"
															/>
														)}
														<div>
															<div className="font-medium">{student.name}</div>
															<div className="text-sm text-muted-foreground">
																Roll: {student.roll}
															</div>
														</div>
													</div>
												</TableCell>
												{examSchedule.components
													.sort((a, b) => a.order - b.order)
													.map((component, componentIndex) => (
														<TableCell key={component.id}>
															<div className="space-y-2">
																<div className="flex items-center gap-2">
																	<Checkbox
																		checked={
																			watchedResults[studentIndex]?.componentResults[
																				componentIndex
																			]?.isAbsent || false
																		}
																		onCheckedChange={checked => {
																			setValue(
																				`results.${studentIndex}.componentResults.${componentIndex}.isAbsent`,
																				!!checked,
																			)
																			if (checked) {
																				setValue(
																					`results.${studentIndex}.componentResults.${componentIndex}.obtainedMarks`,
																					0,
																				)
																			}
																		}}
																	/>
																	<span className="text-xs">Absent</span>
																</div>
																<Input
																	type="number"
																	min="0"
																	max={component.maxMarks}
																	disabled={
																		watchedResults[studentIndex]?.componentResults[
																			componentIndex
																		]?.isAbsent
																	}
																	{...register(
																		`results.${studentIndex}.componentResults.${componentIndex}.obtainedMarks`,
																		{
																			valueAsNumber: true,
																		},
																	)}
																	className="w-20 text-center"
																/>
																<input
																	type="hidden"
																	{...register(
																		`results.${studentIndex}.componentResults.${componentIndex}.examComponentId`,
																	)}
																/>
															</div>
														</TableCell>
													))}
												<TableCell>
													<div className="text-center">
														<div className="font-medium">
															{marks.obtained}/{marks.total}
														</div>
														<div className="text-sm text-muted-foreground">
															{marks.percentage.toFixed(1)}%
														</div>
													</div>
												</TableCell>
												<TableCell>
													{isAbsent ? (
														<Badge variant="destructive">Absent</Badge>
													) : (
														<Badge variant="default">Present</Badge>
													)}
												</TableCell>
												<TableCell>
													<Textarea
														{...register(`results.${studentIndex}.componentResults.0.remarks`)}
														placeholder="Optional remarks..."
														className="min-h-[60px] w-32"
													/>
													<input
														type="hidden"
														{...register(`results.${studentIndex}.studentId`)}
													/>
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</form>
		</div>
	)
}