'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { FormControl } from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface SimplePrismaDecimalInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		'value' | 'onChange'
	> {
	// Form field value - can be Prisma.Decimal, string, number, null or undefined
	value: any
	// Standard onChange handler that receives the value
	onChange: (value: number | string) => void
	// Whether to convert string values to numbers before passing to onChange
	returnAsNumber?: boolean
	// Optional currency symbol
	currencySymbol?: string
	// Display negative values in red
	highlightNegative?: boolean
	// Error state
	error?: boolean
}

/**
 * SimplePrismaDecimalInput - A simplified decimal input that preserves exact values
 *
 * Features:
 * - Preserves exact decimal values without automatic rounding
 * - Compatible with Prisma.Decimal
 * - Can return values as number or string based on your form needs
 * - Supports currency symbol if needed
 * - Simple implementation with precise value handling
 */
export function DecimalInput({
	value,
	onChange,
	returnAsNumber = true,
	currencySymbol = '',
	highlightNegative = false,
	className,
	error,
	...props
}: SimplePrismaDecimalInputProps) {
	// Handle focusing and formatting
	const [isFocused, setIsFocused] = React.useState(false)

	// Get display value
	const getDisplayValue = (): string => {
		// When empty or null, display "0"
		if (value === null || value === undefined || value === '') {
			return '0'
		}

		// Show raw value when focused (without currency symbol)
		if (isFocused) {
			// Handle Prisma.Decimal objects
			if (typeof value === 'object' && value !== null && 'toString' in value) {
				return value.toString()
			}

			// Handle string with currency symbol
			if (typeof value === 'string') {
				return value.replace(new RegExp(`^\\${currencySymbol}`), '').trim()
			}

			return String(value)
		}

		// Show formatted value with currency symbol when not focused
		let displayValue: string

		// Handle Prisma.Decimal objects
		if (typeof value === 'object' && value !== null && 'toString' in value) {
			displayValue = value.toString()
		}
		// Handle string with or without currency
		else if (typeof value === 'string') {
			const hasSymbol = value.startsWith(currencySymbol)
			displayValue = hasSymbol ? value : `${currencySymbol}${value}`
		}
		// Handle number
		else {
			displayValue = `${currencySymbol}${value}`
		}

		return displayValue
	}

	// Handle input changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value

		// Handle empty input - convert to "0" instead of null
		if (!newValue) {
			if (returnAsNumber) {
				onChange(0)
			} else {
				onChange('0')
			}
			return
		}

		// Allow initial minus sign for negative numbers
		if (newValue === '-') {
			onChange(newValue)
			return
		}

		// Allow just a decimal point (will be converted to "0.")
		if (newValue === '.') {
			if (returnAsNumber) {
				onChange(0)
			} else {
				onChange('0.')
			}
			return
		}

		// Special case: if value is just "0" and user types a digit or decimal,
		// handle it appropriately
		if (value === '0' || value === 0) {
			// If typing a decimal after 0, allow "0."
			if (newValue === '0.') {
				if (returnAsNumber) {
					onChange(0)
				} else {
					onChange('0.')
				}
				return
			}

			// If typing a non-zero digit, replace the zero
			if (/^[1-9]$/.test(newValue)) {
				if (returnAsNumber) {
					onChange(Number(newValue))
				} else {
					onChange(newValue)
				}
				return
			}
		}

		// Validation regex - allow valid decimal numbers
		// This allows one decimal point and negative sign
		const regex = /^-?\d*\.?\d*$/
		if (!regex.test(newValue)) {
			return // Invalid input - don't update
		}

		// Remove leading zeros for non-decimal numbers
		if (
			newValue !== '0' &&
			!newValue.includes('.') &&
			newValue.startsWith('0')
		) {
			const cleanedValue = newValue.replace(/^0+/, '') || '0' // If all zeros, keep one zero
			if (returnAsNumber) {
				onChange(Number(cleanedValue))
			} else {
				onChange(cleanedValue)
			}
			return
		}

		// Pass the value as number or string based on returnAsNumber flag
		if (returnAsNumber) {
			// For partially formed decimal values like "123."
			if (newValue.endsWith('.')) {
				onChange(newValue)
			} else {
				onChange(Number(newValue))
			}
		} else {
			onChange(newValue)
		}
	}

	// Handle focus
	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(true)
		e.target.select()

		if (props.onFocus) {
			props.onFocus(e)
		}
	}

	// Handle blur
	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(false)

		if (props.onBlur) {
			props.onBlur(e)
		}
	}

	// Determine if value is negative for styling
	const isNegative = React.useMemo(() => {
		if (value === null || value === undefined || value === '') return false

		let stringValue: string

		if (typeof value === 'object' && value !== null && 'toString' in value) {
			stringValue = value.toString()
		} else {
			stringValue = String(value)
		}

		return stringValue.trim().startsWith('-')
	}, [value])

	return (
		<FormControl>
			<Input
				{...props}
				type="text"
				inputMode="decimal"
				value={getDisplayValue()}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				className={cn(
					className,
					isNegative && highlightNegative && 'text-red-500',
					error && 'border-red-500 focus-visible:ring-red-500',
				)}
			/>
		</FormControl>
	)
}
