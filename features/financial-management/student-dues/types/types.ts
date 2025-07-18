import { FeeCategorySchema } from '@/lib/zod'
import { TransactionClient } from '@/types'
import { z } from 'zod'

export const FeeAdditionSchema = z.object({
	targetType: z.enum(['CLASS', 'SECTION', 'STUDENT']),
	classId: z.string().min(1),
	sectionId: z.string().optional(),
	studentId: z.string().optional(),
	feeDetails: z.object({
		title: z.string().min(1),
		originalAmount: z.number().positive(),
		description: z.string().optional(),
		categoryId: z.string().min(1),
		month: z.number().min(1).max(12),
		year: z.number().min(2020).max(2030),
	}),
})

export type FeeAdditionInput = z.infer<typeof FeeAdditionSchema>

// Types
export interface CreateStudentDuesParams {
	studentId: string
	tenantId: string
	admissionDate: string | Date
	currentDate?: string | Date
	feeStructureId?: string
	tx?: TransactionClient // Optional transaction client
}

export interface DueCreationResult {
	message: string
	createdDuesCount: number
	skippedDuesCount: number
	totalDueItemsCreated: number
	monthsCreated: string[]
	monthsSkipped: string[]
}
