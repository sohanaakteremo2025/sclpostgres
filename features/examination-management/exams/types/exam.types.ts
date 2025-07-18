// types/exam.types.ts
import { z } from 'zod'

// Exam Type Schema
export const ExamTypeSchema = z.object({
	name: z.string().min(1, 'Exam type name is required'),
	weight: z
		.number()
		.min(0.1, 'Weight must be at least 0.1')
		.max(10, 'Weight cannot exceed 10'),
})

// Main Exam Schema
export const ExamSchema = z
	.object({
		title: z.string().min(1, 'Exam title is required'),
		startDate: z.date(),
		endDate: z.date(),
		examTypeId: z.string().min(1, 'Please select an exam type'),
		sessionId: z.string().min(1, 'Please select an academic session'),
	})
	.refine(data => data.endDate >= data.startDate, {
		message: 'End date must be after start date',
		path: ['endDate'],
	})

// Exam Schedule Schema
export const ExamScheduleSchema = z
	.object({
		date: z.date(),
		startTime: z.number().min(0).max(23, 'Start time must be between 0-23'),
		endTime: z.number().min(0).max(23, 'End time must be between 0-23'),
		room: z.string().optional(),
		classId: z.string().min(1, 'Please select a class'),
		sectionId: z.string().optional(),
		subjectId: z.string().min(1, 'Please select a subject'),
		invigilatorIds: z
			.array(z.string())
			.min(1, 'At least one invigilator is required'),
	})
	.refine(data => data.endTime > data.startTime, {
		message: 'End time must be after start time',
		path: ['endTime'],
	})

// Exam Component Schema
export const ExamComponentSchema = z.object({
	name: z.string().min(1, 'Component name is required'),
	maxMarks: z.number().min(1, 'Max marks must be at least 1'),
	order: z.number().min(1, 'Order must be at least 1'),
})

// Complete Exam Creation Schema
export const ExamCreationSchema = z
	.object({
		// Basic exam info
		title: z.string().min(1, 'Exam title is required'),
		startDate: z.date(),
		endDate: z.date(),
		examTypeId: z.string().min(1, 'Please select an exam type'),
		sessionId: z.string().min(1, 'Please select an academic session'),

		// Exam schedules
		schedules: z
			.array(
				z.object({
					date: z.date(),
					startTime: z.number().min(0).max(23),
					endTime: z.number().min(0).max(23),
					room: z.string().optional(),
					classId: z.string().min(1, 'Please select a class'),
					sectionId: z.string().optional(),
					subjectId: z.string().min(1, 'Please select a subject'),
					invigilatorIds: z
						.array(z.string())
						.min(1, 'At least one invigilator is required'),

					// Components for this schedule
					components: z
						.array(
							z.object({
								name: z.string().min(1, 'Component name is required'),
								maxMarks: z.number().min(1, 'Max marks must be at least 1'),
								order: z.number().min(1, 'Order must be at least 1'),
							}),
						)
						.min(1, 'At least one component is required'),
				}),
			)
			.min(1, 'At least one exam schedule is required'),
	})
	.refine(data => data.endDate >= data.startDate, {
		message: 'End date must be after start date',
		path: ['endDate'],
	})

// Type exports
export type ExamTypeFormData = z.infer<typeof ExamTypeSchema>
export type ExamFormData = z.infer<typeof ExamSchema>
export type ExamScheduleFormData = z.infer<typeof ExamScheduleSchema>
export type ExamComponentFormData = z.infer<typeof ExamComponentSchema>
export type ExamCreationFormData = z.infer<typeof ExamCreationSchema>

// Mock data types (replace with your actual types)
export interface ExamType {
	id: string
	name: string
	weight: number
}

export interface AcademicSession {
	id: string
	name: string
	startDate: Date
	endDate: Date
}

export interface Class {
	id: string
	name: string
	sections: Section[]
}

export interface Section {
	id: string
	name: string
}

export interface Subject {
	id: string
	name: string
}

export interface Employee {
	id: string
	name: string
	email: string
}
