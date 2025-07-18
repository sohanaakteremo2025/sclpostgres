'use client'

import { useState } from 'react'
import { FieldValues, FieldPath } from 'react-hook-form'
import { FormField } from './form-field'
import { BaseFieldProps } from '../types/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Clock, ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormTimeInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
	// Time format options
	format?: '12' | '24' // 12-hour or 24-hour format
	step?: number // Step in seconds (default: 300 = 5 minutes)
	showSeconds?: boolean
	// Display options
	placeholder?: string
	// Controlled component props
	value?: string | number // Can be HH:MM string or minutes from midnight (number)
	onChange?: (value: string | number) => void
	onBlur?: () => void
	// Return format
	returnAsMinutes?: boolean // Return as minutes from midnight instead of HH:MM string
	returnAsNumber?: boolean // Return as number (minutes from midnight) - for database int fields
	// Time picker options
	usePopover?: boolean // Use popover with time buttons or inline input
	timeSlots?: string[] // Custom time slots like ['09:00', '10:00', '11:00']
	width?: string
}

// Helper functions
const formatTime = (
	time: string | number,
	format: '12' | '24' = '24',
	showSeconds = false,
): string => {
	let hours: number
	let minutes: number
	let seconds = 0

	if (typeof time === 'number') {
		// Convert minutes from midnight to HH:MM
		hours = Math.floor(time / 60)
		minutes = time % 60
	} else if (typeof time === 'string') {
		const [h, m, s] = time.split(':').map(Number)
		hours = h || 0
		minutes = m || 0
		seconds = s || 0
	} else {
		return ''
	}

	// Ensure valid time
	hours = Math.max(0, Math.min(23, hours))
	minutes = Math.max(0, Math.min(59, minutes))
	seconds = Math.max(0, Math.min(59, seconds))

	if (format === '12') {
		const period = hours >= 12 ? 'PM' : 'AM'
		const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
		const timeStr = showSeconds
			? `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
			: `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
		return `${timeStr} ${period}`
	}

	return showSeconds
		? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
		: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const parseTimeToMinutes = (time: string): number => {
	if (!time) return 0
	const [hours, minutes] = time.split(':').map(Number)
	return (hours || 0) * 60 + (minutes || 0)
}

const parseTimeToString = (time: string | number): string => {
	if (typeof time === 'number') {
		const hours = Math.floor(time / 60)
		const minutes = time % 60
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
	}
	return time || ''
}

// Generate default time slots
const generateTimeSlots = (step: number = 300): string[] => {
	const slots: string[] = []
	for (let i = 0; i < 24 * 60; i += step / 60) {
		const hours = Math.floor(i / 60)
		const minutes = i % 60
		slots.push(
			`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
		)
	}
	return slots
}

export function FormTimeInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	format = '24',
	step = 300,
	showSeconds = false,
	placeholder = 'Select time',
	value: controlledValue,
	onChange: controlledOnChange,
	onBlur: controlledOnBlur,
	returnAsMinutes = false,
	returnAsNumber = false,
	usePopover = false,
	timeSlots,
	width = 'w-full',
}: FormTimeInputProps<TFieldValues, TName>) {
	const [open, setOpen] = useState(false)
	const isDisabled = disabled
	const isControlled = controlledValue !== undefined

	// Use provided time slots or generate them
	const availableTimeSlots = timeSlots || generateTimeSlots(step)

	// Convert value for display
	const getDisplayValue = (value: string | number | undefined): string => {
		if (value === undefined || value === null || value === '') return ''
		return formatTime(value, format, showSeconds)
	}

	// Convert value for input (always 24-hour format for HTML input)
	const getInputValue = (value: string | number | undefined): string => {
		if (value === undefined || value === null || value === '') return ''
		return parseTimeToString(value)
	}

	// Handle value change with proper return format
	const handleTimeChange = (
		newTime: string,
		onChange: (value: any) => void,
	) => {
		if (!newTime) {
			// Return appropriate empty value based on return format
			if (returnAsNumber || returnAsMinutes) {
				onChange(0)
			} else {
				onChange('')
			}
			return
		}

		// Determine return format priority: returnAsNumber > returnAsMinutes > string
		if (returnAsNumber) {
			onChange(parseTimeToMinutes(newTime))
		} else if (returnAsMinutes) {
			onChange(parseTimeToMinutes(newTime))
		} else {
			onChange(newTime)
		}
	}

	// Handle time slot selection
	const handleTimeSlotSelect = (
		timeSlot: string,
		onChange: (value: any) => void,
	) => {
		handleTimeChange(timeSlot, onChange)
		setOpen(false)
	}

	// Render time input (HTML input type="time")
	const renderTimeInput = (
		value: any,
		onChange: (value: any) => void,
		onBlur?: () => void,
	) => (
		<Input
			type="time"
			step={showSeconds ? '1' : '60'}
			value={getInputValue(value)}
			onChange={e => handleTimeChange(e.target.value, onChange)}
			onBlur={onBlur}
			disabled={disabled}
			placeholder={placeholder}
			className={cn(
				width,
				'bg-background appearance-none',
				'[&::-webkit-calendar-picker-indicator]:hidden',
				'[&::-webkit-calendar-picker-indicator]:appearance-none',
			)}
		/>
	)

	// Render time popover with slots
	const renderTimePopover = (
		value: any,
		onChange: (value: any) => void,
		onBlur?: () => void,
	) => (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(width, 'justify-between font-normal')}
					disabled={disabled}
					onBlur={onBlur}
				>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						{getDisplayValue(value) || placeholder}
					</div>
					<ChevronDownIcon className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="max-w-40" align="start">
				<div className="max-h-60 overflow-y-auto p-1">
					{/* Clear option */}
					<Button
						variant="ghost"
						className="w-full justify-start text-muted-foreground"
						onClick={() => handleTimeSlotSelect('', onChange)}
					>
						Clear selection
					</Button>

					{/* Time slots */}
					{availableTimeSlots.map(timeSlot => (
						<Button
							key={timeSlot}
							variant="ghost"
							className={cn(
								'w-full justify-start',
								getInputValue(value) === timeSlot && 'bg-accent',
							)}
							onClick={() => handleTimeSlotSelect(timeSlot, onChange)}
						>
							{formatTime(timeSlot, format, showSeconds)}
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	)

	// Render controlled component
	if (isControlled) {
		return (
			<div className="space-y-2">
				{label && (
					<label className="text-sm font-medium">
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				{usePopover
					? renderTimePopover(
							controlledValue,
							controlledOnChange!,
							controlledOnBlur,
						)
					: renderTimeInput(
							controlledValue,
							controlledOnChange!,
							controlledOnBlur,
						)}

				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
		)
	}

	// Render with form integration
	return (
		<FormField
			name={name}
			label={label}
			description={description}
			required={required}
			disabled={disabled}
		>
			{({ value, onChange: formOnChange, onBlur, disabled: fieldDisabled }) => {
				// Enhanced onChange handler
				const handleFormOnChange = (newValue: any) => {
					formOnChange(newValue)
					if (controlledOnChange) {
						controlledOnChange(newValue)
					}
				}

				const finalValue =
					controlledValue !== undefined ? controlledValue : value
				const finalOnChange = handleFormOnChange
				const finalOnBlur = controlledOnBlur || onBlur

				return usePopover
					? renderTimePopover(finalValue, finalOnChange, finalOnBlur)
					: renderTimeInput(finalValue, finalOnChange, finalOnBlur)
			}}
		</FormField>
	)
}

// Convenience components for common use cases
export const FormTimeInputBasic = <T extends FieldValues>(
	props: FormTimeInputProps<T>,
) => <FormTimeInput {...props} usePopover={false} />

export const FormTimeInputPopover = <T extends FieldValues>(
	props: FormTimeInputProps<T>,
) => <FormTimeInput {...props} usePopover={true} />

export const FormTimeInput12Hour = <T extends FieldValues>(
	props: FormTimeInputProps<T>,
) => <FormTimeInput {...props} format="12" />

export const FormTimeInputMinutes = <T extends FieldValues>(
	props: FormTimeInputProps<T>,
) => <FormTimeInput {...props} returnAsMinutes={true} />

// New convenience component for database integer fields
export const FormTimeInputNumber = <T extends FieldValues>(
	props: FormTimeInputProps<T>,
) => <FormTimeInput {...props} returnAsNumber={true} />
