import { z } from 'zod'

// Enhanced validation schemas
export const componentResultSchema = z.object({
	examComponentId: z.string().min(1, 'Component ID is required'),
	obtainedMarks: z
		.number()
		.min(0, 'Marks cannot be negative')
		.max(1000, 'Marks seem unusually high'), // Basic sanity check
	isAbsent: z.boolean().default(false),
	remarks: z.string().max(500, 'Remarks too long').optional(),
})

export const studentResultSchema = z.object({
	studentId: z.string().min(1, 'Student ID is required'),
	componentResults: z
		.array(componentResultSchema)
		.min(1, 'At least one component result is required'),
})

export const bulkResultEntrySchema = z.object({
	examScheduleId: z.string().min(1, 'Exam schedule ID is required'),
	results: z
		.array(studentResultSchema)
		.min(1, 'At least one student result is required'),
})

// Validation functions
export interface ValidationError {
	studentId?: string
	studentName?: string
	componentId?: string
	componentName?: string
	field: string
	message: string
	severity: 'error' | 'warning'
}

export function validateResultEntry(
	data: any,
	examSchedule: any,
	students: any[]
): ValidationError[] {
	const errors: ValidationError[] = []
	
	try {
		// Basic schema validation
		bulkResultEntrySchema.parse(data)
	} catch (zodError) {
		if (zodError instanceof z.ZodError) {
			zodError.errors.forEach(error => {
				errors.push({
					field: error.path.join('.'),
					message: error.message,
					severity: 'error',
				})
			})
		}
	}

	// Additional business logic validation
	if (data.results && Array.isArray(data.results)) {
		const studentMap = new Map(students.map(s => [s.id, s]))
		const componentMap = new Map(
			examSchedule.components?.map((c: any) => [c.id, c]) || []
		)

		data.results.forEach((result: any, resultIndex: number) => {
			const student = studentMap.get(result.studentId)
			const studentName = student?.name || 'Unknown Student'

			// Validate student exists
			if (!student) {
				errors.push({
					studentId: result.studentId,
					studentName,
					field: `results.${resultIndex}.studentId`,
					message: 'Student not found in the class/section',
					severity: 'error',
				})
				return
			}

			// Validate component results
			if (result.componentResults && Array.isArray(result.componentResults)) {
				const providedComponents = new Set()
				
				result.componentResults.forEach((cr: any, crIndex: number) => {
					const component = componentMap.get(cr.examComponentId)
					const componentName = component?.name || 'Unknown Component'

					// Check for duplicate components
					if (providedComponents.has(cr.examComponentId)) {
						errors.push({
							studentId: result.studentId,
							studentName,
							componentId: cr.examComponentId,
							componentName,
							field: `results.${resultIndex}.componentResults.${crIndex}`,
							message: 'Duplicate component result',
							severity: 'error',
						})
					}
					providedComponents.add(cr.examComponentId)

					// Validate component exists
					if (!component) {
						errors.push({
							studentId: result.studentId,
							studentName,
							componentId: cr.examComponentId,
							componentName,
							field: `results.${resultIndex}.componentResults.${crIndex}.examComponentId`,
							message: 'Component not found in exam schedule',
							severity: 'error',
						})
						return
					}

					// Validate marks range
					if (!cr.isAbsent) {
						if (cr.obtainedMarks > component.maxMarks) {
							errors.push({
								studentId: result.studentId,
								studentName,
								componentId: cr.examComponentId,
								componentName,
								field: `results.${resultIndex}.componentResults.${crIndex}.obtainedMarks`,
								message: `Marks cannot exceed maximum (${component.maxMarks})`,
								severity: 'error',
							})
						}

						// Warning for perfect scores (might be intentional)
						if (cr.obtainedMarks === component.maxMarks) {
							errors.push({
								studentId: result.studentId,
								studentName,
								componentId: cr.examComponentId,
								componentName,
								field: `results.${resultIndex}.componentResults.${crIndex}.obtainedMarks`,
								message: `Perfect score - please verify`,
								severity: 'warning',
							})
						}

						// Warning for very low scores
						if (cr.obtainedMarks < component.maxMarks * 0.1) {
							errors.push({
								studentId: result.studentId,
								studentName,
								componentId: cr.examComponentId,
								componentName,
								field: `results.${resultIndex}.componentResults.${crIndex}.obtainedMarks`,
								message: `Very low score - please verify`,
								severity: 'warning',
							})
						}
					}

					// Validate absent logic
					if (cr.isAbsent && cr.obtainedMarks > 0) {
						errors.push({
							studentId: result.studentId,
							studentName,
							componentId: cr.examComponentId,
							componentName,
							field: `results.${resultIndex}.componentResults.${crIndex}`,
							message: 'Absent students cannot have marks',
							severity: 'error',
						})
					}
				})

				// Check for missing components
				const requiredComponents = examSchedule.components || []
				requiredComponents.forEach((component: any) => {
					if (!providedComponents.has(component.id)) {
						errors.push({
							studentId: result.studentId,
							studentName,
							componentId: component.id,
							componentName: component.name,
							field: `results.${resultIndex}.componentResults`,
							message: `Missing result for component: ${component.name}`,
							severity: 'error',
						})
					}
				})
			}
		})

		// Check for duplicate students
		const studentIds = data.results.map((r: any) => r.studentId)
		const duplicateStudents = studentIds.filter(
			(id: string, index: number) => studentIds.indexOf(id) !== index
		)

		duplicateStudents.forEach((studentId: string) => {
			const student = studentMap.get(studentId)
			errors.push({
				studentId,
				studentName: student?.name || 'Unknown',
				field: 'results',
				message: 'Duplicate student result',
				severity: 'error',
			})
		})
	}

	return errors
}

// Grade calculation validation
export function validateGradeCalculation(
	percentage: number,
	gradingScale?: any
): { isValid: boolean; grade?: string; warnings: string[] } {
	const warnings: string[] = []
	
	if (percentage < 0 || percentage > 100) {
		return {
			isValid: false,
			warnings: ['Invalid percentage value'],
		}
	}

	if (!gradingScale || !gradingScale.items) {
		warnings.push('No grading scale configured')
		return {
			isValid: true,
			grade: 'N/A',
			warnings,
		}
	}

	const gradeItem = gradingScale.items.find(
		(item: any) => percentage >= item.minPercentage && percentage <= item.maxPercentage
	)

	if (!gradeItem) {
		warnings.push('Percentage does not match any grade range')
		return {
			isValid: true,
			grade: 'N/A',
			warnings,
		}
	}

	return {
		isValid: true,
		grade: gradeItem.grade,
		warnings,
	}
}

// Result statistics validation
export function validateResultStatistics(results: any[]): {
	isValid: boolean
	warnings: string[]
	statistics: any
} {
	const warnings: string[] = []
	
	if (!results || results.length === 0) {
		return {
			isValid: false,
			warnings: ['No results to analyze'],
			statistics: null,
		}
	}

	const presentResults = results.filter(r => !r.isAbsent)
	const absentCount = results.length - presentResults.length
	
	if (absentCount > results.length * 0.5) {
		warnings.push('More than 50% students are absent')
	}

	if (presentResults.length > 0) {
		const averagePercentage = 
			presentResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / presentResults.length

		if (averagePercentage < 40) {
			warnings.push('Class average is very low')
		} else if (averagePercentage > 90) {
			warnings.push('Class average is unusually high')
		}

		const highestMarks = Math.max(...presentResults.map(r => r.obtainedMarks))
		const lowestMarks = Math.min(...presentResults.map(r => r.obtainedMarks))
		
		if (highestMarks === lowestMarks && presentResults.length > 1) {
			warnings.push('All students have identical marks')
		}
	}

	return {
		isValid: true,
		warnings,
		statistics: {
			totalStudents: results.length,
			presentStudents: presentResults.length,
			absentStudents: absentCount,
		},
	}
}

// Export types
export type { ValidationError }
export type BulkResultEntry = z.infer<typeof bulkResultEntrySchema>
export type StudentResult = z.infer<typeof studentResultSchema>
export type ComponentResult = z.infer<typeof componentResultSchema>