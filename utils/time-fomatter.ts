/**
 * Time formatting utilities for handling time values in different formats
 * Supports: minutes from midnight (number), HH:MM strings, and 12/24 hour formats
 */

export type TimeFormat = '12' | '24'
export type TimeValue = string | number | null | undefined

/**
 * Convert minutes from midnight to HH:MM format
 * @param minutes - Minutes from midnight (e.g., 900 = 15:00)
 * @returns HH:MM string in 24-hour format
 */
export const minutesToTimeString = (minutes: number): string => {
	if (minutes < 0 || minutes >= 24 * 60) {
		return '00:00'
	}

	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60

	return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Convert HH:MM string to minutes from midnight
 * @param timeString - Time string in HH:MM format
 * @returns Minutes from midnight
 */
export const timeStringToMinutes = (timeString: string): number => {
	if (!timeString || !timeString.includes(':')) {
		return 0
	}

	const [hours, minutes] = timeString.split(':').map(Number)

	if (isNaN(hours) || isNaN(minutes)) {
		return 0
	}

	return Math.max(0, Math.min(23 * 60 + 59, hours * 60 + minutes))
}

/**
 * Format time value to display string
 * @param value - Time value (string, number, or null/undefined)
 * @param format - '12' or '24' hour format
 * @param showSeconds - Whether to show seconds
 * @returns Formatted time string
 */
export const formatTimeForDisplay = (
	value: TimeValue,
	format: TimeFormat = '24',
	showSeconds: boolean = false,
): string => {
	if (value === null || value === undefined || value === '') {
		return ''
	}

	let timeString: string

	if (typeof value === 'number') {
		timeString = minutesToTimeString(value)
	} else {
		timeString = value
	}

	if (!timeString || !timeString.includes(':')) {
		return ''
	}

	const [h, m, s] = timeString.split(':').map(Number)
	const hours = h || 0
	const minutes = m || 0
	const seconds = s || 0

	// Ensure valid time
	const validHours = Math.max(0, Math.min(23, hours))
	const validMinutes = Math.max(0, Math.min(59, minutes))
	const validSeconds = Math.max(0, Math.min(59, seconds))

	if (format === '12') {
		const period = validHours >= 12 ? 'PM' : 'AM'
		const displayHours =
			validHours === 0 ? 12 : validHours > 12 ? validHours - 12 : validHours

		const timeStr = showSeconds
			? `${displayHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}:${validSeconds.toString().padStart(2, '0')}`
			: `${displayHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}`

		return `${timeStr} ${period}`
	}

	return showSeconds
		? `${validHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}:${validSeconds.toString().padStart(2, '0')}`
		: `${validHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}`
}

/**
 * Parse time value to minutes from midnight
 * @param value - Time value (string, number, or null/undefined)
 * @returns Minutes from midnight
 */
export const parseTimeToMinutes = (value: TimeValue): number => {
	if (value === null || value === undefined || value === '') {
		return 0
	}

	if (typeof value === 'number') {
		return Math.max(0, Math.min(23 * 60 + 59, value))
	}

	return timeStringToMinutes(value)
}

/**
 * Parse time value to HH:MM string
 * @param value - Time value (string, number, or null/undefined)
 * @returns HH:MM string in 24-hour format
 */
export const parseTimeToString = (value: TimeValue): string => {
	if (value === null || value === undefined || value === '') {
		return ''
	}

	if (typeof value === 'number') {
		return minutesToTimeString(value)
	}

	// Validate and normalize string
	if (!value.includes(':')) {
		return ''
	}

	const [hours, minutes] = value.split(':').map(Number)

	if (isNaN(hours) || isNaN(minutes)) {
		return ''
	}

	const validHours = Math.max(0, Math.min(23, hours))
	const validMinutes = Math.max(0, Math.min(59, minutes))

	return `${validHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}`
}

/**
 * Generate time slots for time picker
 * @param stepMinutes - Step in minutes (default: 5)
 * @param format - '12' or '24' hour format for display
 * @returns Array of time slot objects with value and label
 */
export const generateTimeSlots = (
	stepMinutes: number = 5,
	format: TimeFormat = '24',
): Array<{ value: string; label: string; minutes: number }> => {
	const slots: Array<{ value: string; label: string; minutes: number }> = []

	for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
		const timeString = minutesToTimeString(minutes)
		const displayLabel = formatTimeForDisplay(timeString, format)

		slots.push({
			value: timeString,
			label: displayLabel,
			minutes: minutes,
		})
	}

	return slots
}

/**
 * Validate if a time value is valid
 * @param value - Time value to validate
 * @returns boolean indicating if time is valid
 */
export const isValidTime = (value: TimeValue): boolean => {
	if (value === null || value === undefined || value === '') {
		return false
	}

	if (typeof value === 'number') {
		return value >= 0 && value < 24 * 60
	}

	if (typeof value === 'string') {
		if (!value.includes(':')) {
			return false
		}

		const [hours, minutes] = value.split(':').map(Number)

		if (isNaN(hours) || isNaN(minutes)) {
			return false
		}

		return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
	}

	return false
}

/**
 * Get current time as minutes from midnight
 * @returns Current time in minutes from midnight
 */
export const getCurrentTimeAsMinutes = (): number => {
	const now = new Date()
	return now.getHours() * 60 + now.getMinutes()
}

/**
 * Get current time as HH:MM string
 * @returns Current time as HH:MM string
 */
export const getCurrentTimeAsString = (): string => {
	return minutesToTimeString(getCurrentTimeAsMinutes())
}

/**
 * Compare two time values
 * @param time1 - First time value
 * @param time2 - Second time value
 * @returns -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
export const compareTimes = (time1: TimeValue, time2: TimeValue): number => {
	const minutes1 = parseTimeToMinutes(time1)
	const minutes2 = parseTimeToMinutes(time2)

	if (minutes1 < minutes2) return -1
	if (minutes1 > minutes2) return 1
	return 0
}

/**
 * Check if time is between start and end times
 * @param time - Time to check
 * @param startTime - Start time
 * @param endTime - End time
 * @returns boolean indicating if time is within range
 */
export const isTimeBetween = (
	time: TimeValue,
	startTime: TimeValue,
	endTime: TimeValue,
): boolean => {
	const timeMinutes = parseTimeToMinutes(time)
	const startMinutes = parseTimeToMinutes(startTime)
	const endMinutes = parseTimeToMinutes(endTime)

	if (startMinutes <= endMinutes) {
		// Same day range
		return timeMinutes >= startMinutes && timeMinutes <= endMinutes
	} else {
		// Crosses midnight
		return timeMinutes >= startMinutes || timeMinutes <= endMinutes
	}
}

/**
 * Add minutes to a time value
 * @param time - Base time value
 * @param minutesToAdd - Minutes to add (can be negative)
 * @returns New time value as minutes from midnight
 */
export const addMinutesToTime = (
	time: TimeValue,
	minutesToAdd: number,
): number => {
	const baseMinutes = parseTimeToMinutes(time)
	const newMinutes = baseMinutes + minutesToAdd

	// Handle overflow/underflow with modulo
	return ((newMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
}

/**
 * Format time duration in minutes to readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "1h 30m")
 */
export const formatDuration = (minutes: number): string => {
	if (minutes < 0) return '0m'

	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60

	if (hours === 0) {
		return `${mins}m`
	}

	if (mins === 0) {
		return `${hours}h`
	}

	return `${hours}h ${mins}m`
}
