import { z } from 'zod'

// Zod Schema Definition
export const examComponentSchema = z.object({
	name: z.string().min(1, 'Component name is required'),
	maxMarks: z
		.number()
		.min(1, 'Max marks must be at least 1')
		.max(1000, 'Max marks cannot exceed 1000'),
	order: z.number().min(1, 'Order must be at least 1').default(1),
})
export const examScheduleSchema = z
	.object({
		subjectId: z.string().min(1, 'Subject is required'),
		date: z
			.date({
				required_error: 'Date is required',
				invalid_type_error: 'Invalid date format',
			})
			.refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
				message: 'Date cannot be in the past',
			}),
		startTime: z
			.number()
			.min(0, 'Start time is required')
			.max(2359, 'Invalid time format'),
		endTime: z
			.number()
			.min(0, 'End time is required')
			.max(2359, 'Invalid time format'),
		room: z.string().optional(),
		invigilatorIds: z.array(z.string()).default([]),
		components: z
			.array(examComponentSchema)
			.min(1, 'At least one component is required'),
	})
	.refine(data => data.endTime > data.startTime, {
		message: 'End time must be after start time',
		path: ['endTime'],
	})

export const bulkExamScheduleSchema = z
	.object({
		examId: z.string().min(1, 'Exam selection is required'),
		classId: z.string().min(1, 'Class selection is required'),
		sectionId: z.string().optional(),
		schedules: z
			.array(examScheduleSchema)
			.min(1, 'At least one schedule is required'),
	})
	.refine(
		data => {
			// Check for duplicate subjects
			const subjectIds = data.schedules.map(s => s.subjectId)
			const uniqueSubjects = new Set(subjectIds)
			return uniqueSubjects.size === subjectIds.length
		},
		{
			message: 'Duplicate subjects are not allowed',
			path: ['schedules'],
		},
	)

// Type inference from schema
export type BulkExamScheduleFormData = z.infer<typeof bulkExamScheduleSchema>
export type ExamSchedule = z.infer<typeof examScheduleSchema>
export type ExamComponent = z.infer<typeof examComponentSchema>
