import {
	startOfMonth,
	addMonths,
	isAfter,
	format,
	getMonth,
	getYear,
} from 'date-fns'

/**
 * Get all months between two dates (inclusive)
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Array<{month: number, year: number}>} Array of month-year objects
 */
export function getMonthsBetween(
	startDate: string | Date,
	endDate: string | Date,
): { month: number; year: number }[] {
	const months = []
	let current = startOfMonth(new Date(startDate))
	const end = startOfMonth(new Date(endDate))

	while (!isAfter(current, end)) {
		months.push({
			month: getMonth(current) + 1, // date-fns months are 0-based, convert to 1-based
			year: getYear(current),
		})
		current = addMonths(current, 1)
	}

	return months
}

/**
 * Get months from a start date to current date
 * @param {string|Date} startDate - Start date
 * @returns {Array<{month: number, year: number}>} Array of month-year objects
 */
export function getMonthsFromDateToCurrent(
	startDate: string | Date,
): { month: number; year: number }[] {
	return getMonthsBetween(startDate, new Date())
}

/**
 * Format month-year object to readable string
 * @param {Object} monthYear - Month-year object
 * @param {number} monthYear.month - Month (1-12)
 * @param {number} monthYear.year - Year
 * @returns {string} Formatted string like "January 2024"
 */
export function formatMonthYear(monthYear: {
	month: number
	year: number
}): string {
	const date = new Date(monthYear.year, monthYear.month - 1, 1)
	return format(date, 'MMMM yyyy')
}

/**
 * Check if a month-year is in the past
 * @param {Object} monthYear - Month-year object
 * @param {number} monthYear.month - Month (1-12)
 * @param {number} monthYear.year - Year
 * @returns {boolean} True if the month is in the past
 */
export function isMonthInPast(monthYear: {
	month: number
	year: number
}): boolean {
	const targetMonth = startOfMonth(
		new Date(monthYear.year, monthYear.month - 1, 1),
	)
	const currentMonth = startOfMonth(new Date())
	return isAfter(currentMonth, targetMonth)
}
