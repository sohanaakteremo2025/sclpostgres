// Zod Schemas
import { z } from 'zod'
import {
	DueAdjustmentTypeSchema,
	DueAdjustmentCategorySchema,
	FeeCategorySchema,
	PaymentMethodSchema,
	FeeCategory,
	DueAdjustmentType,
	DueAdjustmentCategory,
	DueItemStatus,
} from '@/lib/zod'
import { DueAdjustmentStatus } from '@prisma/client'

export const DueAdjustmentSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	amount: z.number(),
	type: DueAdjustmentTypeSchema,
	category: DueAdjustmentCategorySchema,
	reason: z.string().optional(),
})

export const FeeItemCollectionSchema = z.object({
	dueItemId: z.string(),
	collectAmount: z.number().min(0),
	accountId: z.string(),
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

export interface DueAdjustment {
	id?: string
	title: string
	amount: number
	type: DueAdjustmentType
	category: DueAdjustmentCategory
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
	category: FeeCategory
	adjustments: DueAdjustment[]
}

export interface StudentDue {
	id: string
	month: number
	year: number
	createdAt: string
	dueItems: DueItem[]
}
