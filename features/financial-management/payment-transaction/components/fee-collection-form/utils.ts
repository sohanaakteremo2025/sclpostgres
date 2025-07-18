// utils/fee-collection.ts
import { DueAdjustmentType } from '@/lib/zod'
import { DueItem, StudentDue } from './types'

export const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]

export const adjustmentAmountBasedOnType = (
	amount: number,
	type: DueAdjustmentType,
): number => {
	if (type === 'DISCOUNT' || type === 'WAIVER') {
		return -Number(amount)
	}
	return Number(amount)
}

export const calculateRemainingAmount = (item: DueItem): number => {
	return item.finalAmount - item.paidAmount
}

export const calculateTotalAdjustments = (item: DueItem): number => {
	return item.adjustments.reduce(
		(sum, adj) => sum + adjustmentAmountBasedOnType(adj.amount, adj.type),
		0,
	)
}

export const getUnpaidItems = (due: StudentDue): DueItem[] => {
	return due.dueItems.filter(
		item => item.finalAmount > item.paidAmount && item.status !== 'PAID',
	)
}

export const calculateTotalDue = (items: DueItem[]): number => {
	return items.reduce((sum, item) => sum + calculateRemainingAmount(item), 0)
}

export const formatMonthYear = (month: number, year: number): string => {
	return `${monthNames[month - 1]} ${year}`
}

// State persistence helpers
export const saveUIState = (studentId: string, state: any) => {
	if (typeof window !== 'undefined') {
		const key = `feeCollection_${studentId}`
		// Convert Sets to arrays for storage
		const stateToSave = {
			expandedDues: Array.from(state.expandedDues || []),
			selectedMonths: Array.from(state.selectedMonths || []),
			adjustmentForms: Array.from(state.adjustmentForms || []),
		}
		sessionStorage.setItem(key, JSON.stringify(stateToSave))
	}
}

export const loadUIState = (
	studentId: string,
): {
	expandedDues: string[]
	selectedMonths: string[]
	adjustmentForms: string[]
} | null => {
	if (typeof window !== 'undefined') {
		const key = `feeCollection_${studentId}`
		const saved = sessionStorage.getItem(key)
		if (saved) {
			try {
				const parsed = JSON.parse(saved)
				return {
					expandedDues: parsed.expandedDues || [],
					selectedMonths: parsed.selectedMonths || [],
					adjustmentForms: parsed.adjustmentForms || [],
				}
			} catch (error) {
				console.warn('Failed to parse saved UI state:', error)
				return null
			}
		}
	}
	return null
}
