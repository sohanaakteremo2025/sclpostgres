import { z } from 'zod'

// Component result schema
export const componentResultSchema = z.object({
	examComponentId: z.string().min(1, 'Component is required'),
	obtainedMarks: z
		.number()
		.min(0, 'Marks must be 0 or greater')
		.max(1000, 'Marks cannot exceed 1000'),
	isAbsent: z.boolean().default(false),
	remarks: z.string().optional(),
})

// Student result schema
export const studentResultSchema = z.object({
	studentId: z.string().min(1, 'Student is required'),
	componentResults: z
		.array(componentResultSchema)
		.min(1, 'At least one component result is required'),
})

// Bulk result entry schema
export const bulkResultEntrySchema = z.object({
	examScheduleId: z.string().min(1, 'Exam schedule is required'),
	results: z
		.array(studentResultSchema)
		.min(1, 'At least one student result is required'),
})

// Result publication schema
export const resultPublicationSchema = z.object({
	examScheduleId: z.string().min(1, 'Exam schedule is required'),
	notifyStudents: z.boolean().default(false),
	notifyParents: z.boolean().default(false),
	publishedBy: z.string().optional(),
})

// Result update schema
export const resultUpdateSchema = z.object({
	componentResultId: z.string().min(1, 'Component result ID is required'),
	obtainedMarks: z
		.number()
		.min(0, 'Marks must be 0 or greater')
		.max(1000, 'Marks cannot exceed 1000'),
	remarks: z.string().optional(),
})

// Filter schemas
export const resultPublicationFiltersSchema = z.object({
	examId: z.string().optional(),
	classId: z.string().optional(),
	sectionId: z.string().optional(),
	sessionId: z.string().optional(),
	isPublished: z.boolean().optional(),
	subjectId: z.string().optional(),
})

export const studentResultFiltersSchema = z.object({
	studentId: z.string().min(1, 'Student ID is required'),
	sessionId: z.string().optional(),
	examTypeId: z.string().optional(),
	subjectId: z.string().optional(),
})

export const classResultFiltersSchema = z.object({
	classId: z.string().min(1, 'Class ID is required'),
	sectionId: z.string().optional(),
	sessionId: z.string().min(1, 'Session ID is required'),
	examTypeId: z.string().optional(),
	subjectId: z.string().optional(),
})

// Type exports
export type ComponentResultFormData = z.infer<typeof componentResultSchema>
export type StudentResultFormData = z.infer<typeof studentResultSchema>
export type BulkResultEntryFormData = z.infer<typeof bulkResultEntrySchema>
export type ResultPublicationFormData = z.infer<typeof resultPublicationSchema>
export type ResultUpdateFormData = z.infer<typeof resultUpdateSchema>
export type ResultPublicationFilters = z.infer<typeof resultPublicationFiltersSchema>
export type StudentResultFilters = z.infer<typeof studentResultFiltersSchema>
export type ClassResultFilters = z.infer<typeof classResultFiltersSchema>

// Database types for better type safety
export interface ExamScheduleWithRelations {
	id: string
	date: Date
	startTime: number
	endTime: number
	room?: string
	createdAt: Date
	updatedAt: Date
	exam: {
		id: string
		title: string
		examType: {
			id: string
			name: string
		}
		session: {
			id: string
			title: string
		}
	}
	class: {
		id: string
		name: string
	}
	section?: {
		id: string
		name: string
	}
	subject: {
		id: string
		name: string
	}
	components: Array<{
		id: string
		name: string
		maxMarks: number
		order: number
	}>
	results: Array<{
		id: string
		obtainedMarks: number
		totalMarks: number
		percentage?: number
		grade?: string
		isAbsent: boolean
		student: {
			id: string
			name: string
			roll: string
			photo?: string
		}
	}>
	resultPublish?: Array<{
		id: string
		isPublished: boolean
		publishedAt?: Date
		publishedBy?: string
	}>
}

export interface ResultPublicationWithRelations {
	id: string
	isPublished: boolean
	publishedAt?: Date
	publishedBy?: string
	examSchedule: ExamScheduleWithRelations
}

export interface ExamResultWithRelations {
	id: string
	obtainedMarks: number
	totalMarks: number
	percentage?: number
	grade?: string
	isAbsent: boolean
	createdAt: Date
	updatedAt: Date
	student: {
		id: string
		name: string
		roll: string
		photo?: string
	}
	componentResults: Array<{
		id: string
		obtainedMarks: number
		isAbsent: boolean
		remarks?: string
		examComponent: {
			id: string
			name: string
			maxMarks: number
			order: number
		}
	}>
	examSchedule: ExamScheduleWithRelations
}

export interface ResultStatistics {
	totalStudents: number
	presentStudents: number
	absentStudents: number
	averagePercentage: number
	highestMarks: number
	lowestMarks: number
	gradeDistribution: Record<string, number>
	passRate: number
	componentStats: Array<{
		componentId: string
		componentName: string
		averageMarks: number
		averagePercentage: number
		highestMarks: number
		lowestMarks: number
	}>
}

// Search params type for the page
export interface ResultPublicationSearchParams {
	page?: string
	limit?: string
	search?: string
	examId?: string
	classId?: string
	sectionId?: string
	sessionId?: string
	subjectId?: string
	isPublished?: string
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}