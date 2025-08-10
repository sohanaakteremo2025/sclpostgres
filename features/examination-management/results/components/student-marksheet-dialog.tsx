'use client'

import PrintWrapper from '@/components/PrintWrapper'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { getTenantPublic } from '@/lib/tenant'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, FileText, GraduationCap, Loader2 } from 'lucide-react'
import { getStudentMarksheetData } from '../api/student-marksheet.action'

interface Student {
	id: string
	name: string
	roll: string
	photo?: string
	studentId: string
	fatherName?: string
	motherName?: string
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
	onOpenChange,
}: StudentMarksheetDialogProps) {
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

	// Fetch tenant data
	const { data: tenantData, isLoading: tenantLoading } = useQuery({
		queryKey: ['tenant-public'],
		queryFn: getTenantPublic,
		enabled: open,
		staleTime: 10 * 60 * 1000, // 10 minutes
	})

	const getGradeBadgeVariant = (grade?: string) => {
		if (!grade) return 'secondary'
		if (grade.startsWith('A')) return 'default'
		if (grade.startsWith('B')) return 'secondary'
		if (grade.startsWith('C')) return 'outline'
		return 'destructive'
	}

	// Grading function based on percentage
	const getGradeFromPercentage = (
		percentage: number,
	): { grade: string; gradePoint: number } => {
		if (percentage >= 80) return { grade: 'A+', gradePoint: 5 }
		if (percentage >= 70) return { grade: 'A', gradePoint: 4 }
		if (percentage >= 60) return { grade: 'A-', gradePoint: 3.5 }
		if (percentage >= 50) return { grade: 'B', gradePoint: 3 }
		if (percentage >= 40) return { grade: 'C', gradePoint: 2 }
		if (percentage >= 33) return { grade: 'D', gradePoint: 1 }
		return { grade: 'F', gradePoint: 0 }
	}

	const groupedResults = marksheetData?.results.reduce(
		(acc, result) => {
			const examType = result.examSchedule.exam.examType.name
			if (!acc[examType]) {
				acc[examType] = []
			}
			acc[examType].push(result)
			return acc
		},
		{} as Record<string, typeof marksheetData.results>,
	)

	// Get all unique components across all results for consistent table headers
	const getAllComponents = (results: typeof marksheetData.results) => {
		const componentsMap = new Map<string, { name: string; maxMarks: number }>()

		results.forEach(result => {
			result.componentResults.forEach(cr => {
				const key = cr.examComponent.name
				if (!componentsMap.has(key)) {
					componentsMap.set(key, {
						name: cr.examComponent.name,
						maxMarks: cr.examComponent.maxMarks,
					})
				}
			})
		})

		return Array.from(componentsMap.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center gap-3">
						<GraduationCap className="h-6 w-6" />
						Student Marksheet
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-auto">
					<PrintWrapper
						buttonText="Print Marksheet"
						buttonClass="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium mt-4"
						buttonPosition="top"
						documentTitle={`Marksheet-${student.name}-${student.roll}`}
						pageStyle={`
							@page {
								size: A4;
								margin: 15mm;
							}
							@media print {
								body {
									-webkit-print-color-adjust: exact;
									color-adjust: exact;
									margin: 0;
									margin-top: 15mm;
									padding: 0;
									font-family: Arial, sans-serif;
									font-size: 12px;
									line-height: 1.3;
								}
								.no-print {
									display: none !important;
								}
								.marksheet-container {
									max-width: 210mm;
									margin: 0 auto;
									padding: 10mm;
									box-sizing: border-box;
								}
								.border-thick {
									border: 3px solid #16a085 !important;
								}
								.grade-table {
									font-size: 10px;
								}
								.grade-table td, .grade-table th {
									padding: 2px 4px;
								}
								.main-table {
									font-size: 11px;
								}
								.main-table td, .main-table th {
									padding: 4px 6px;
									border: 1px solid #000;
								}
								.school-logo {
									width: 80px;
									height: 80px;
								}
								.school-logo-dialog {
									width: 120px;
									height: 120px;
								}
							}
						`}
					>
						{marksheetLoading || tenantLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin mr-2" />
								Loading marksheet data...
							</div>
						) : marksheetError ? (
							<div className="flex items-center justify-center py-12">
								<div className="text-center">
									<AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Error Loading Marksheet
									</h3>
									<p className="text-muted-foreground">
										{marksheetError.message || 'Failed to load marksheet data'}
									</p>
								</div>
							</div>
						) : !marksheetData?.results?.length ? (
							<div className="flex items-center justify-center py-12">
								<div className="text-center">
									<FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										No Results Available
									</h3>
									<p className="text-muted-foreground">
										No published exam results found for this student.
									</p>
								</div>
							</div>
						) : (
							<div
								className="marksheet-container bg-white border-thick border-[#16a085] p-4"
								style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px' }}
							>
								{/* Header with School Info */}
								<div className="mb-4">
									<div className="flex items-start justify-between mb-4 w-full">
										{/* School Logo and Name */}
										<div className="flex items-center space-x-4 flex-1">
											{tenantData?.logo ? (
												<img
													src={tenantData.logo}
													alt="School Logo"
													className="school-logo-dialog md:school-logo object-contain w-24 h-24 flex-shrink-0"
												/>
											) : (
												<div className="school-logo-dialog md:school-logo border border-gray-400 bg-gray-100 flex items-center justify-center flex-shrink-0">
													<GraduationCap className="h-8 w-8 text-gray-400" />
												</div>
											)}
											<div className="text-left flex-1 max-w-md">
												<h1 className="text-xl font-bold text-gray-800 mb-1">
													{tenantData?.name || 'School Management System'}
												</h1>
												<p className="text-sm text-gray-600">
													{tenantData?.address ||
														'Address and contact information'}
												</p>
											</div>
										</div>

										{/* Grading Scale */}
										<div className="flex-shrink-0">
											<table className="grade-table border border-gray-400 text-xs">
												<thead>
													<tr className="bg-gray-100">
														<th className="border border-gray-400 px-2 py-1 text-center">
															Letter Grade
														</th>
														<th className="border border-gray-400 px-2 py-1 text-center">
															Marks Range (%)
														</th>
														<th className="border border-gray-400 px-2 py-1 text-center">
															Grade Point
														</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td className="border border-gray-400 px-2 py-1 text-center font-semibold">
															A+
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															80 - 100
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															5
														</td>
													</tr>
													<tr>
														<td className="border border-gray-400 px-2 py-1 text-center font-semibold">
															A
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															70 - 79
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															4
														</td>
													</tr>
													<tr>
														<td className="border border-gray-400 px-2 py-1 text-center font-semibold">
															A-
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															60 - 69
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															3.5
														</td>
													</tr>
													<tr>
														<td className="border border-gray-400 px-2 py-1 text-center font-semibold">
															B
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															50 - 59
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															3
														</td>
													</tr>
													<tr>
														<td className="border border-gray-400 px-2 py-1 text-center font-semibold">
															C
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															40 - 49
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															2
														</td>
													</tr>
													<tr>
														<td className="border border-gray-400 px-2 py-1 text-center font-semibold">
															D
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															33 - 39
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															1
														</td>
													</tr>
													<tr>
														<td className="border border-gray-400 px-2 py-1 text-center font-semibold">
															F
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															0 - 32
														</td>
														<td className="border border-gray-400 px-2 py-1 text-center">
															0
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>

									<div className="text-center">
										<h2 className="text-lg font-semibold text-gray-700 underline">
											Academic Transcript
										</h2>
									</div>
								</div>

								{/* Student Information Grid */}
								<div className="grid grid-cols-2 gap-8 mb-4 text-sm">
									<div className="space-y-2">
										<div className="flex">
											<span className="font-semibold w-32">
												Name of Student:
											</span>
											<span>{student.name}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Father's Name:</span>
											<span>{student.fatherName || '-'}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Mother's Name:</span>
											<span>{student.motherName || '-'}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Year:</span>
											<span>{new Date().getFullYear()}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Class:</span>
											<span>{student.class?.name}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Roll No.:</span>
											<span>{student.roll}</span>
										</div>
									</div>
									<div className="space-y-2">
										<div className="flex">
											<span className="font-semibold w-32">
												Central Exam Roll:
											</span>
											<span>{student.studentId}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Student ID:</span>
											<span>{student.studentId}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Group:</span>
											<span>{student.section?.name || '-'}</span>
										</div>
										<div className="flex">
											<span className="font-semibold w-32">Session:</span>
											<span>{student.session?.title || 'Current Session'}</span>
										</div>
									</div>
								</div>

								{/* Results Table */}
								{Object.entries(groupedResults || {}).map(
									([examType, results]) => {
										const components = getAllComponents(results)
										const dynamicColSpan = components.length + 1 // +1 for "Full Marks" column

										return (
											<div key={examType} className="mb-6">
												<div className="overflow-hidden border border-black">
													<table className="main-table w-full border-collapse">
														<thead>
															<tr className="bg-yellow-100">
																<th
																	rowSpan={2}
																	className="border border-black p-2 text-center font-bold"
																>
																	Subject
																</th>
																<th
																	colSpan={dynamicColSpan}
																	className="border border-black p-2 text-center font-bold"
																>
																	{examType} Exam
																</th>
																<th
																	rowSpan={2}
																	className="border border-black p-2 text-center font-bold"
																>
																	Highest Marks
																</th>
																<th
																	rowSpan={2}
																	className="border border-black p-2 text-center font-bold"
																>
																	Total Marks
																</th>
																<th
																	rowSpan={2}
																	className="border border-black p-2 text-center font-bold"
																>
																	Letter Grade
																</th>
																<th
																	rowSpan={2}
																	className="border border-black p-2 text-center font-bold"
																>
																	Grade Point
																</th>
															</tr>
															<tr className="bg-yellow-100">
																<th className="border border-black p-2 text-center font-bold">
																	Full Marks
																</th>
																{components.map(component => (
																	<th
																		key={component.name}
																		className="border border-black p-2 text-center font-bold"
																	>
																		{component.name}
																	</th>
																))}
															</tr>
														</thead>
														<tbody>
															{results.map((result, index) => {
																// Use our grading function for consistent grading
																const gradeInfo = result.isAbsent
																	? { grade: 'F', gradePoint: 0 }
																	: getGradeFromPercentage(result.percentage)

																// Create a map of component results for easy lookup
																const componentResultsMap = new Map(
																	result.componentResults.map(cr => [
																		cr.examComponent.name,
																		cr,
																	]),
																)

																return (
																	<tr
																		key={result.id}
																		className={
																			index % 2 === 0
																				? 'bg-white'
																				: 'bg-gray-50'
																		}
																	>
																		<td className="border border-black p-2">
																			{result.examSchedule.subject.name}
																		</td>
																		<td className="border border-black p-2 text-center">
																			{result.totalMarks}
																		</td>
																		{components.map(component => {
																			const componentResult =
																				componentResultsMap.get(component.name)
																			const marks =
																				componentResult?.obtainedMarks || 0

																			return (
																				<td
																					key={component.name}
																					className="border border-black p-2 text-center"
																				>
																					{result.isAbsent ? '-' : marks}
																				</td>
																			)
																		})}
																		<td className="border border-black p-2 text-center font-semibold text-blue-600">
																			{Math.ceil(result.totalMarks * 0.85)}
																		</td>
																		<td className="border border-black p-2 text-center font-semibold">
																			{result.isAbsent
																				? '-'
																				: result.obtainedMarks}
																		</td>
																		<td className="border border-black p-2 text-center font-bold">
																			{gradeInfo.grade}
																		</td>
																		<td className="border border-black p-2 text-center">
																			{gradeInfo.gradePoint}
																		</td>
																	</tr>
																)
															})}
														</tbody>
													</table>
												</div>

												{/* Summary Table */}
												<div className="mt-4">
													<table className="w-full border border-black">
														<tbody>
															<tr className="bg-teal-100">
																<td className="border border-black p-2 font-bold text-center">
																	Summary
																</td>
																<td className="border border-black p-2 text-center font-semibold">
																	Total Exam Marks
																	<br />
																	{results.reduce(
																		(sum, result) => sum + result.totalMarks,
																		0,
																	)}
																</td>
																<td className="border border-black p-2 text-center font-semibold">
																	Obtained Total Marks
																	<br />
																	{results.reduce(
																		(sum, result) => sum + result.obtainedMarks,
																		0,
																	)}{' '}
																	(
																	{(
																		(results.reduce(
																			(sum, result) =>
																				sum + result.obtainedMarks,
																			0,
																		) /
																			results.reduce(
																				(sum, result) =>
																					sum + result.totalMarks,
																				0,
																			)) *
																		100
																	).toFixed(2)}
																	%)
																</td>
																<td className="border border-black p-2 text-center font-semibold">
																	GPA
																	<br />
																	{(
																		results.reduce((sum, result) => {
																			const gradeInfo = result.isAbsent
																				? { gradePoint: 0 }
																				: getGradeFromPercentage(
																						result.percentage,
																					)
																			return sum + gradeInfo.gradePoint
																		}, 0) / results.length
																	).toFixed(2)}
																</td>
																<td className="border border-black p-2 text-center font-semibold">
																	Letter Grade
																	<br />
																	{(() => {
																		const gpa =
																			results.reduce((sum, result) => {
																				const gradeInfo = result.isAbsent
																					? { gradePoint: 0 }
																					: getGradeFromPercentage(
																							result.percentage,
																						)
																				return sum + gradeInfo.gradePoint
																			}, 0) / results.length
																		return getGradeFromPercentage(gpa * 20)
																			.grade // Convert GPA back to percentage for grade lookup
																	})()}
																</td>
															</tr>
														</tbody>
													</table>
												</div>
											</div>
										)
									},
								)}

								{/* Signature Section */}
								<div className="flex justify-end items-end mt-8 pt-4">
									<div className="text-center">
										<div className="w-32 border-b border-gray-600 mb-1"></div>
										<p className="text-xs text-gray-600">Head Master</p>
									</div>
								</div>

								{/* Footer */}
								<div className="text-center mt-4 text-xs text-gray-500">
									<p>Generated on {new Date().toLocaleDateString()}</p>
								</div>
							</div>
						)}
					</PrintWrapper>
				</div>
			</DialogContent>
		</Dialog>
	)
}
