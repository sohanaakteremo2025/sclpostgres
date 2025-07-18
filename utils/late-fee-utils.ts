import {
	DueAdjustmentCategory,
	DueAdjustmentType,
	LateFeeFrequency,
} from '@/lib/zod'
import {
	addDays,
	isBefore,
	differenceInDays,
	differenceInWeeks,
	differenceInMonths,
} from 'date-fns'
import { Decimal } from 'decimal.js'

interface FeeItem {
	lateFeeEnabled: boolean
	lateFeeFrequency?: LateFeeFrequency
	lateFeeAmount?: number | Decimal
	lateFeeGraceDays?: number
}

interface LateFeeCalculation {
	shouldApply: boolean
	amount: number | Decimal
	daysOverdue: number
	dueDate: Date
	effectiveDate: Date
}

/**
 * Calculate the due date for a fee item in a specific month/year
 * @param month - Month (1-12)
 * @param year - Year
 * @param graceDays - Grace days to add after month end
 * @returns Due date
 */
export function calculateDueDate(
	month: number,
	year: number,
	graceDays: number = 0,
): Date {
	// Get the last day of the month
	const lastDayOfMonth = new Date(year, month, 0)

	// Add grace days
	return addDays(lastDayOfMonth, graceDays)
}

/**
 * Calculate the effective date when late fees start applying
 * @param month - Month (1-12)
 * @param year - Year
 * @param graceDays - Grace days to add after month end
 * @returns Effective date (day after due date)
 */
export function calculateEffectiveDate(
	month: number,
	year: number,
	graceDays: number = 0,
): Date {
	const dueDate = calculateDueDate(month, year, graceDays)
	return addDays(dueDate, 1) // Late fees apply the day after due date
}

/**
 * Check if late fee should be applied for a fee item
 * @param feeItem - Fee item configuration
 * @param dueMonth - Month the fee is due (1-12)
 * @param dueYear - Year the fee is due
 * @param currentDate - Current date (defaults to now)
 * @returns Boolean indicating if late fee should be applied
 */
export function shouldApplyLateFee(
	feeItem: FeeItem,
	dueMonth: number,
	dueYear: number,
	currentDate: Date = new Date(),
): boolean {
	// Early return if late fees are disabled
	if (!feeItem.lateFeeEnabled) {
		return false
	}

	const effectiveDate = calculateEffectiveDate(
		dueMonth,
		dueYear,
		feeItem.lateFeeGraceDays || 0,
	)

	// Late fee applies if current date is after the effective date
	return (
		isBefore(effectiveDate, currentDate) ||
		effectiveDate.getTime() === currentDate.getTime()
	)
}

/**
 * Calculate the late fee amount based on frequency and overdue period
 * @param feeItem - Fee item configuration
 * @param dueMonth - Month the fee is due (1-12)
 * @param dueYear - Year the fee is due
 * @param currentDate - Current date (defaults to now)
 * @returns Late fee amount
 */
export function calculateLateFeeAmount(
	feeItem: FeeItem,
	dueMonth: number,
	dueYear: number,
	currentDate: Date = new Date(),
): number {
	// Early returns
	if (!feeItem.lateFeeEnabled || !feeItem.lateFeeAmount) {
		return 0
	}

	if (!shouldApplyLateFee(feeItem, dueMonth, dueYear, currentDate)) {
		return 0
	}

	const lateFeeAmount = Number(feeItem.lateFeeAmount)
	const effectiveDate = calculateEffectiveDate(
		dueMonth,
		dueYear,
		feeItem.lateFeeGraceDays || 0,
	)

	switch (feeItem.lateFeeFrequency) {
		case 'ONE_TIME':
			return lateFeeAmount

		case 'DAILY': {
			const daysDiff = differenceInDays(currentDate, effectiveDate)
			return lateFeeAmount * Math.max(1, daysDiff) // Minimum 1 day
		}

		case 'WEEKLY': {
			const weeksDiff = differenceInWeeks(currentDate, effectiveDate)
			return lateFeeAmount * Math.max(1, weeksDiff) // Minimum 1 week
		}

		case 'MONTHLY': {
			const monthsDiff = differenceInMonths(currentDate, effectiveDate)
			return lateFeeAmount * Math.max(1, monthsDiff) // Minimum 1 month
		}

		default:
			// Default to ONE_TIME if frequency not specified
			return lateFeeAmount
	}
}

/**
 * Get comprehensive late fee calculation details
 * @param feeItem - Fee item configuration
 * @param dueMonth - Month the fee is due (1-12)
 * @param dueYear - Year the fee is due
 * @param currentDate - Current date (defaults to now)
 * @returns Detailed late fee calculation
 */
export function getLateFeeCalculation(
	feeItem: FeeItem,
	dueMonth: number,
	dueYear: number,
	currentDate: Date = new Date(),
): LateFeeCalculation {
	const dueDate = calculateDueDate(
		dueMonth,
		dueYear,
		feeItem.lateFeeGraceDays || 0,
	)
	const effectiveDate = calculateEffectiveDate(
		dueMonth,
		dueYear,
		feeItem.lateFeeGraceDays || 0,
	)
	const shouldApply = shouldApplyLateFee(
		feeItem,
		dueMonth,
		dueYear,
		currentDate,
	)
	const amount = calculateLateFeeAmount(feeItem, dueMonth, dueYear, currentDate)

	const daysOverdue = shouldApply
		? Math.max(0, differenceInDays(currentDate, effectiveDate))
		: 0

	return {
		shouldApply,
		amount,
		daysOverdue,
		dueDate,
		effectiveDate,
	}
}

/**
 * Generate late fee adjustment data
 * @param feeItem - Fee item configuration
 * @param dueMonth - Month the fee is due (1-12)
 * @param dueYear - Year the fee is due
 * @param currentDate - Current date (defaults to now)
 * @returns Adjustment data or null if no late fee should be applied
 */
export function generateLateFeeAdjustment(
	feeItem: { name: string } & FeeItem,
	dueMonth: number,
	dueYear: number,
	currentDate: Date = new Date(),
): {
	title: string
	amount: number
	type: DueAdjustmentType
	reason: string
	category: DueAdjustmentCategory
	appliedBy: string
} | null {
	const calculation = getLateFeeCalculation(
		feeItem,
		dueMonth,
		dueYear,
		currentDate,
	)

	if (!calculation.shouldApply || Number(calculation.amount) <= 0) {
		return null
	}

	const frequencyText = feeItem.lateFeeFrequency
		? ` (${feeItem.lateFeeFrequency.toLowerCase()})`
		: ''

	return {
		title: `Late Fee - ${feeItem.name}${frequencyText}`,
		amount: Number(calculation.amount),
		type: 'LATE_FEE' as const,
		reason: `Late payment for ${dueMonth}/${dueYear}. ${calculation.daysOverdue} days overdue.`,
		category: 'LATE_FEE',
		appliedBy: 'SYSTEM',
	}
}

/**
 * Validate late fee configuration
 * @param feeItem - Fee item to validate
 * @returns Validation result with errors if any
 */
export function validateLateFeeConfig(feeItem: FeeItem): {
	isValid: boolean
	errors: string[]
} {
	const errors: string[] = []

	if (feeItem.lateFeeEnabled) {
		if (!feeItem.lateFeeAmount || Number(feeItem.lateFeeAmount) <= 0) {
			errors.push(
				'Late fee amount must be greater than 0 when late fees are enabled',
			)
		}

		if (feeItem.lateFeeGraceDays && feeItem.lateFeeGraceDays < 0) {
			errors.push('Grace days cannot be negative')
		}

		if (
			feeItem.lateFeeFrequency &&
			!['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(
				feeItem.lateFeeFrequency,
			)
		) {
			errors.push('Invalid late fee frequency')
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

/**
 * Format late fee calculation for display
 * @param calculation - Late fee calculation result
 * @returns Formatted string for user display
 */
export function formatLateFeeCalculation(
	calculation: LateFeeCalculation,
): string {
	if (!calculation.shouldApply) {
		return 'No late fee applicable'
	}

	return `Late fee: $${calculation.amount.toFixed(2)} (${calculation.daysOverdue} days overdue)`
}
