'use client'

import * as React from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { FormControl } from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface EnumSelectProps<T extends string> {
	// Enum values to display as options
	enumValues: Record<string, T> | ReadonlyArray<T>
	// Current value
	value: T | undefined | null
	// Change handler
	onChange: (value: T) => void
	// Optional placeholder text
	placeholder?: string
	// Optional text transformation function
	formatOptionLabel?: (value: T) => string
	// Optional custom render function for items
	renderItem?: (value: T) => React.ReactNode
	// Optional className for the component
	className?: string
	// Optional disabled state
	disabled?: boolean
	// Optional error state
	error?: boolean
	// Additional props to pass to the SelectTrigger
	triggerProps?: React.ComponentProps<typeof SelectTrigger>
}

/**
 * EnumSelect - A simplified select component for enum values
 *
 * Features:
 * - Works with TypeScript enums
 * - Supports custom formatting of enum values
 * - Handles null/undefined values gracefully
 * - Compatible with React Hook Form
 */
export function EnumSelect<T extends string>({
	enumValues,
	value,
	onChange,
	placeholder = 'Select an option',
	formatOptionLabel,
	renderItem,
	className,
	disabled,
	error,
	triggerProps,
}: EnumSelectProps<T>) {
	// Convert enum to array of values
	const options = React.useMemo(() => {
		if (Array.isArray(enumValues)) {
			return enumValues as T[]
		}

		// Handle object-based enums
		return Object.values(enumValues) as T[]
	}, [enumValues])

	// Format the display label for an enum value
	const formatLabel = React.useCallback(
		(enumValue: T): string => {
			if (formatOptionLabel) {
				return formatOptionLabel(enumValue)
			}

			// Default formatting: replace underscores with spaces and capitalize each word
			return enumValue
				.replace(/_/g, ' ')
				.replace(
					/\w\S*/g,
					txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
				)
		},
		[formatOptionLabel],
	)

	return (
		<Select
			value={value || undefined}
			onValueChange={onChange}
			disabled={disabled}
		>
			<FormControl>
				<SelectTrigger
					className={cn(
						className,
						error && 'border-red-500 focus-visible:ring-red-500',
					)}
					{...triggerProps}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
			</FormControl>
			<SelectContent>
				{options.map(option => (
					<SelectItem key={option} value={option}>
						{renderItem ? renderItem(option) : formatLabel(option)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
