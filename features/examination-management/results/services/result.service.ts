import { prisma } from '@/lib/db'
import Decimal from 'decimal.js'

// Types for result publishing
interface PublishResultsInput {
	examScheduleId: string
	publishedBy: string
	tenantId: string
	notifyStudents?: boolean
	notifyParents?: boolean
}

interface BulkResultInput {
	examScheduleId: string
	results: {
		studentId: string
		componentResults: {
			examComponentId: string
			obtainedMarks: number
			isAbsent?: boolean
			remarks?: string
		}[]
	}[]
	enteredBy: string
	tenantId: string
}

interface ResultValidationError {
	studentId: string
	studentName: string
	componentId: string
	componentName: string
	error: string
}

// Core result calculation functions
const calculateGrade = async (
	percentage: number,
	tenantId: string,
): Promise<{ grade: string; gradePoint?: number }> => {
	const gradingScale = await prisma.gradingScale.findFirst({
		where: { tenantId },
		include: {
			items: {
				orderBy: { minPercentage: 'asc' },
			},
		},
	})

	if (!gradingScale) {
		return { grade: 'N/A' }
	}

	const gradeItem = gradingScale.items.find(
		item =>
			percentage >= item.minPercentage && percentage <= item.maxPercentage,
	)

	return {
		grade: gradeItem?.grade || 'F',
		gradePoint: gradeItem?.gradePoint || 0,
	}
}

const calculateExamResult = async (
	examScheduleId: string,
	studentId: string,
	componentResults: any[],
	tenantId: string,
) => {
	const totalObtainedMarks = componentResults.reduce(
		(sum, result) => (result.isAbsent ? sum : sum + result.obtainedMarks),
		0,
	)

	const totalMaxMarks = componentResults.reduce(
		(sum, result) => sum + result.examComponent.maxMarks,
		0,
	)

	const percentage =
		totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0
	const isAbsent = componentResults.some(result => result.isAbsent)

	const gradeInfo = await calculateGrade(percentage, tenantId)

	return {
		examScheduleId,
		studentId,
		obtainedMarks: totalObtainedMarks,
		totalMarks: totalMaxMarks,
		percentage: percentage,
		grade: isAbsent ? 'ABS' : gradeInfo.grade,
		isAbsent,
		tenantId,
	}
}

// Validation functions
const validateResultInput = async (
	input: BulkResultInput,
): Promise<ResultValidationError[]> => {
	const errors: ResultValidationError[] = []

	// Get exam schedule with components
	const examSchedule = await prisma.examSchedule.findUnique({
		where: { id: input.examScheduleId },
		include: {
			components: true,
			class: true,
			section: true,
			subject: true,
		},
	})

	if (!examSchedule) {
		throw new Error('Exam schedule not found')
	}

	// Get students for validation
	const students = await prisma.student.findMany({
		where: {
			id: { in: input.results.map(r => r.studentId) },
			tenantId: input.tenantId,
		},
		select: { id: true, name: true },
	})

	const studentMap = new Map(students.map(s => [s.id, s.name]))

	for (const result of input.results) {
		const studentName = studentMap.get(result.studentId) || 'Unknown'

		// Validate student exists
		if (!studentMap.has(result.studentId)) {
			errors.push({
				studentId: result.studentId,
				studentName,
				componentId: '',
				componentName: '',
				error: 'Student not found',
			})
			continue
		}

		// Validate component results
		for (const componentResult of result.componentResults) {
			const component = examSchedule.components.find(
				c => c.id === componentResult.examComponentId,
			)

			if (!component) {
				errors.push({
					studentId: result.studentId,
					studentName,
					componentId: componentResult.examComponentId,
					componentName: 'Unknown',
					error: 'Component not found',
				})
				continue
			}

			// Validate marks range
			if (!componentResult.isAbsent) {
				if (
					componentResult.obtainedMarks < 0 ||
					componentResult.obtainedMarks > component.maxMarks
				) {
					errors.push({
						studentId: result.studentId,
						studentName,
						componentId: componentResult.examComponentId,
						componentName: component.name,
						error: `Marks must be between 0 and ${component.maxMarks}`,
					})
				}
			}
		}

		// Validate all components are provided
		const providedComponents = new Set(
			result.componentResults.map(cr => cr.examComponentId),
		)
		const requiredComponents = examSchedule.components.map(c => c.id)

		for (const requiredComponent of requiredComponents) {
			if (!providedComponents.has(requiredComponent)) {
				const component = examSchedule.components.find(
					c => c.id === requiredComponent,
				)
				errors.push({
					studentId: result.studentId,
					studentName,
					componentId: requiredComponent,
					componentName: component?.name || 'Unknown',
					error: 'Component result missing',
				})
			}
		}
	}

	return errors
}

// Main result management functions
export const enterBulkResultsService = async (input: BulkResultInput) => {
	console.log('enterBulkResultsService - Input:', {
		examScheduleId: input.examScheduleId,
		tenantId: input.tenantId,
		enteredBy: input.enteredBy,
		resultsCount: input.results.length
	})

	if (!input.tenantId) {
		throw new Error('Tenant ID is required')
	}

	// Validate input
	const validationErrors = await validateResultInput(input)
	if (validationErrors.length > 0) {
		throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`)
	}

	return await prisma.$transaction(async tx => {
		const results = []

		for (const studentResult of input.results) {
			// Delete existing results for this student and exam
			await tx.examResult.deleteMany({
				where: {
					examScheduleId: input.examScheduleId,
					studentId: studentResult.studentId,
				},
			})

			await tx.examComponentResult.deleteMany({
				where: {
					examComponent: {
						examScheduleId: input.examScheduleId,
					},
					studentId: studentResult.studentId,
				},
			})

			// First create the main exam result with temporary data
			const tempExamResult = await tx.examResult.create({
				data: {
					examScheduleId: input.examScheduleId,
					studentId: studentResult.studentId,
					obtainedMarks: 0, // Will be calculated after components
					totalMarks: 0,
					percentage: 0,
					grade: 'TEMP',
					isAbsent: false,
					tenantId: input.tenantId,
				},
			})

			// Create component results
			const componentResults = []
			for (const componentResult of studentResult.componentResults) {
				const created = await tx.examComponentResult.create({
					data: {
						examComponentId: componentResult.examComponentId,
						studentId: studentResult.studentId,
						obtainedMarks: componentResult.isAbsent
							? 0
							: componentResult.obtainedMarks,
						isAbsent: componentResult.isAbsent || false,
						remarks: componentResult.remarks,
						tenantId: input.tenantId,
						examResultId: tempExamResult.id,
					},
					include: {
						examComponent: true,
					},
				})
				componentResults.push(created)
			}

			// Calculate and update the exam result with correct values
			const calculatedResult = await calculateExamResult(
				input.examScheduleId,
				studentResult.studentId,
				componentResults,
				input.tenantId,
			)

			const examResult = await tx.examResult.update({
				where: { id: tempExamResult.id },
				data: {
					obtainedMarks: calculatedResult.obtainedMarks,
					totalMarks: calculatedResult.totalMarks,
					percentage: calculatedResult.percentage,
					grade: calculatedResult.grade,
					isAbsent: calculatedResult.isAbsent,
				},
			})

			results.push({
				examResult,
				componentResults,
			})
		}

		return results
	})
}

export const publishResultsService = async (input: PublishResultsInput) => {
	return await prisma.$transaction(async tx => {
		// Check if already published
		const existingPublish = await tx.resultPublish.findFirst({
			where: {
				examScheduleId: input.examScheduleId,
				isPublished: true,
			},
		})

		if (existingPublish) {
			throw new Error('Results are already published for this exam')
		}

		// Validate that all results are entered
		const examSchedule = await tx.examSchedule.findUnique({
			where: { id: input.examScheduleId },
			include: {
				class: true,
				section: true,
				results: true,
				exam: true,
				subject: true,
			},
		})

		if (!examSchedule) {
			throw new Error('Exam schedule not found')
		}

		// Get students who should have results
		const expectedStudents = await tx.student.findMany({
			where: {
				classId: examSchedule.classId,
				sectionId: examSchedule.sectionId || undefined,
				tenantId: input.tenantId,
				status: 'ACTIVE',
			},
			select: { id: true, name: true, roll: true },
		})

		const studentResults = examSchedule.results.map(r => r.studentId)
		const missingResults = expectedStudents.filter(
			s => !studentResults.includes(s.id),
		)

		if (missingResults.length > 0) {
			throw new Error(
				`Results missing for students: ${missingResults.map(s => s.name).join(', ')}`,
			)
		}

		// Create or update result publish record
		const resultPublish = await tx.resultPublish.upsert({
			where: {
				examScheduleId: input.examScheduleId,
			},
			create: {
				examScheduleId: input.examScheduleId,
				publishedBy: input.publishedBy,
				publishedAt: new Date(),
				isPublished: true,
				tenantId: input.tenantId,
			},
			update: {
				publishedBy: input.publishedBy,
				publishedAt: new Date(),
				isPublished: true,
			},
		})

		// TODO: Send notifications if required
		if (input.notifyStudents || input.notifyParents) {
			// Implement notification logic here
			console.log('Notifications would be sent here')
		}

		return {
			resultPublish,
			publishedResultsCount: examSchedule.results.length,
			examSchedule: {
				id: examSchedule.id,
				exam: examSchedule.exam,
				class: examSchedule.class,
				section: examSchedule.section,
				subject: examSchedule.subject,
			},
		}
	})
}

export const unpublishResultsService = async (
	examScheduleId: string,
	unpublishedById: string,
) => {
	return await prisma.$transaction(async tx => {
		const resultPublish = await tx.resultPublish.findFirst({
			where: {
				examScheduleId,
				isPublished: true,
			},
		})

		if (!resultPublish) {
			throw new Error('Results are not published for this exam')
		}

		await tx.resultPublish.update({
			where: { id: resultPublish.id },
			data: {
				isPublished: false,
				publishedAt: null,
				publishedBy: unpublishedById,
			},
		})

		return { success: true, message: 'Results unpublished successfully' }
	})
}

// Query functions
export const getExamResultsService = async (
	examScheduleId: string,
	includeUnpublished: boolean = false,
) => {
	const whereClause: any = { examScheduleId }

	if (!includeUnpublished) {
		whereClause.examSchedule = {
			resultPublish: {
				some: {
					isPublished: true,
				},
			},
		}
	}

	return await prisma.examResult.findMany({
		where: whereClause,
		include: {
			student: {
				select: {
					id: true,
					name: true,
					roll: true,
					photo: true,
				},
			},
			componentResults: {
				include: {
					examComponent: true,
				},
				orderBy: {
					examComponent: {
						order: 'asc',
					},
				},
			},
			examSchedule: {
				include: {
					exam: {
						include: {
							examType: true,
						},
					},
					subject: true,
					class: true,
					section: true,
				},
			},
		},
		orderBy: {
			student: {
				roll: 'asc',
			},
		},
	})
}

export const getStudentResultsService = async (
	studentId: string,
	sessionId?: string,
) => {
	const whereClause: any = {
		studentId,
		examSchedule: {
			resultPublish: {
				some: {
					isPublished: true,
				},
			},
		},
	}

	if (sessionId) {
		whereClause.examSchedule.exam = {
			sessionId,
		}
	}

	return await prisma.examResult.findMany({
		where: whereClause,
		include: {
			componentResults: {
				include: {
					examComponent: true,
				},
			},
			examSchedule: {
				include: {
					exam: {
						include: {
							examType: true,
						},
					},
					subject: true,
					class: true,
					section: true,
				},
			},
		},
		orderBy: {
			examSchedule: {
				exam: {
					startDate: 'desc',
				},
			},
		},
	})
}

export const getClassResultsService = async (
	classId: string,
	sectionId: string,
	sessionId: string,
) => {
	return await prisma.examResult.findMany({
		where: {
			examSchedule: {
				classId,
				sectionId,
				exam: {
					sessionId,
				},
				resultPublish: {
					some: {
						isPublished: true,
					},
				},
			},
		},
		include: {
			student: {
				select: {
					id: true,
					name: true,
					roll: true,
				},
			},
			componentResults: {
				include: {
					examComponent: true,
				},
			},
			examSchedule: {
				include: {
					exam: {
						include: {
							examType: true,
						},
					},
					subject: true,
				},
			},
		},
		orderBy: [
			{
				examSchedule: {
					exam: {
						startDate: 'asc',
					},
				},
			},
			{
				student: {
					roll: 'asc',
				},
			},
		],
	})
}

export const getResultStatisticsService = async (examScheduleId: string) => {
	const results = await prisma.examResult.findMany({
		where: { examScheduleId },
		include: {
			student: {
				select: { id: true, name: true },
			},
		},
	})

	const totalStudents = results.length
	const absentStudents = results.filter(r => r.isAbsent).length
	const presentStudents = totalStudents - absentStudents

	const presentResults = results.filter(r => !r.isAbsent)
	const averagePercentage =
		presentResults.length > 0
			? presentResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
				presentResults.length
			: 0

	const highestMarks =
		presentResults.length > 0
			? Math.max(...presentResults.map(r => r.obtainedMarks))
			: 0

	const lowestMarks =
		presentResults.length > 0
			? Math.min(...presentResults.map(r => r.obtainedMarks))
			: 0

	// Grade distribution
	const gradeDistribution = presentResults.reduce(
		(acc, result) => {
			const grade = result.grade || 'N/A'
			acc[grade] = (acc[grade] || 0) + 1
			return acc
		},
		{} as Record<string, number>,
	)

	return {
		totalStudents,
		presentStudents,
		absentStudents,
		averagePercentage: Math.round(averagePercentage * 100) / 100,
		highestMarks,
		lowestMarks,
		gradeDistribution,
	}
}

// Audit functions
export const updateComponentResultService = async (
	componentResultId: string,
	newMarks: number,
	updatedById: string,
	remarks?: string,
) => {
	return await prisma.$transaction(async tx => {
		const componentResult = await tx.examComponentResult.findUnique({
			where: { id: componentResultId },
			include: {
				examComponent: true,
				examResult: true,
			},
		})

		if (!componentResult) {
			throw new Error('Component result not found')
		}

		// Create audit log
		await tx.resultAuditLog.create({
			data: {
				examComponentResultId: componentResultId,
				oldMarks: componentResult.obtainedMarks,
				newMarks,
				updatedById,
				tenantId: componentResult.tenantId,
			},
		})

		// Update component result
		await tx.examComponentResult.update({
			where: { id: componentResultId },
			data: {
				obtainedMarks: newMarks,
				remarks: remarks || componentResult.remarks,
			},
		})

		// Recalculate exam result
		const allComponentResults = await tx.examComponentResult.findMany({
			where: {
				examResultId: componentResult.examResultId,
			},
			include: {
				examComponent: true,
			},
		})

		const updatedComponentResults = allComponentResults.map(cr =>
			cr.id === componentResultId ? { ...cr, obtainedMarks: newMarks } : cr,
		)

		const recalculatedResult = await calculateExamResult(
			componentResult.examResult.examScheduleId,
			componentResult.examResult.studentId,
			updatedComponentResults,
			componentResult.tenantId,
		)

		await tx.examResult.update({
			where: { id: componentResult.examResultId },
			data: {
				obtainedMarks: recalculatedResult.obtainedMarks,
				percentage: recalculatedResult.percentage,
				grade: recalculatedResult.grade,
			},
		})

		return { success: true, message: 'Result updated successfully' }
	})
}

// Usage examples
// export const resultPublishingExample = async () => {
// 	try {
// 		// 1. Enter bulk results
// 		const bulkResults = await enterBulkResultsService({
// 			examScheduleId: 'exam-schedule-id',
// 			results: [
// 				{
// 					studentId: 'student-1',
// 					componentResults: [
// 						{
// 							examComponentId: 'theory-component-id',
// 							obtainedMarks: 85,
// 							remarks: 'Good performance',
// 						},
// 						{
// 							examComponentId: 'practical-component-id',
// 							obtainedMarks: 92,
// 						},
// 					],
// 				},
// 			],
// 			enteredById: 'teacher-id',
// 			tenantId: 'tenant-id',
// 		})

// 		console.log('Bulk results entered:', bulkResults)

// 		// 2. Publish results
// 		const publishResult = await publishResults({
// 			examScheduleId: 'exam-schedule-id',
// 			publishedById: 'admin-id',
// 			tenantId: 'tenant-id',
// 			notifyStudents: true,
// 			notifyParents: true,
// 		})

// 		console.log('Results published:', publishResult)

// 		// 3. Get published results
// 		const examResults = await getExamResults('exam-schedule-id')
// 		console.log('Published results:', examResults)

// 		// 4. Get statistics
// 		const statistics = await getResultStatistics('exam-schedule-id')
// 		console.log('Result statistics:', statistics)
// 	} catch (error) {
// 		console.error('Error in result publishing:', error)
// 	}
// }
