// types/fee-collection.ts
import { z } from 'zod'
import {
	DueAdjustmentType,
	DueItemStatus,
	DueAdjustmentTypeSchema,
} from '@/lib/zod'
import { DueAdjustmentStatus } from '@prisma/client'

// Enhanced types for better state management
export interface DueAdjustment {
	id?: string
	title: string
	amount: number
	type: DueAdjustmentType
	category: string
	status: DueAdjustmentStatus
	reason?: string
}

export interface DueItem {
	id: string
	title: string
	originalAmount: number
	finalAmount: number
	paidAmount: number
	description?: string
	status: DueItemStatus
	category: string
	adjustments: DueAdjustment[]
}

export interface StudentDue {
	id: string
	month: number
	year: number
	createdAt: string
	dueItems: DueItem[]
}

// UI State management interfaces
export interface UIState {
	expandedDues: Set<string>
	selectedMonths: Set<string>
	adjustmentForms: Set<string> // Track which items have adjustment forms open
}

export interface FeeCollectionState {
	uiState: UIState
	formData: any
}

// Form schemas
export const DueAdjustmentSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	amount: z.number().min(0.01, 'Amount must be greater than 0'),
	type: z.nativeEnum(DueAdjustmentTypeSchema.enum),
	category: z.string(),
	reason: z.string().optional(),
})

export const FeeItemCollectionSchema = z.object({
	dueItemId: z.string(),
	collectAmount: z.number().min(0),
	accountId: z.string().min(1, 'Account is required'),
})

export const MonthCollectionSchema = z.object({
	monthId: z.string(),
	month: z.number(),
	year: z.number(),
	feeItems: z.array(FeeItemCollectionSchema),
})

export const FeeCollectionFormSchema = z.object({
	reason: z.string().optional(),
	monthCollections: z
		.array(MonthCollectionSchema)
		.min(1, 'At least one month must be selected'),
})

export type FeeCollectionFormData = z.infer<typeof FeeCollectionFormSchema>
export type MonthCollectionData = z.infer<typeof MonthCollectionSchema>
export type FeeItemCollectionData = z.infer<typeof FeeItemCollectionSchema>
