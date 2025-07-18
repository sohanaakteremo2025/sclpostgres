'use client'

import { FieldValues, Path } from 'react-hook-form'
import { FormField } from './form-field'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { useState } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface FormDatePickerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
	name: TName
	label?: string
	description?: string
	required?: boolean
	disabled?: boolean
	placeholder?: string
	dateFormat?: string
	minDate?: Date
	maxDate?: Date
}

export function FormDatePicker<
	TFieldValues extends FieldValues = FieldValues,
	TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	placeholder = 'Select date',
	dateFormat = 'PPP',
	minDate,
	maxDate,
}: FormDatePickerProps<TFieldValues, TName>) {
	const [open, setOpen] = useState(false)

	return (
		<FormField
			name={name}
			label={label}
			description={description}
			required={required}
			disabled={disabled}
		>
			{({ value, onChange, onBlur, disabled: fieldDisabled }) => {
				// Handle both Date objects and date strings
				let dateValue: Date | undefined
				if (value instanceof Date) {
					dateValue = value
				} else if (typeof value === 'string' && value) {
					dateValue = new Date(value)
				} else {
					dateValue = undefined
				}

				return (
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									'w-full justify-start text-left font-normal',
									!dateValue && 'text-muted-foreground',
								)}
								disabled={fieldDisabled}
								onBlur={onBlur}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{dateValue && !isNaN(dateValue.getTime())
									? format(dateValue, dateFormat)
									: placeholder}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								endMonth={
									maxDate || new Date(new Date().getFullYear() + 10, 12, 31)
								}
								startMonth={
									minDate || new Date(new Date().getFullYear() - 50, 1, 1)
								}
								mode="single"
								selected={
									dateValue && !isNaN(dateValue.getTime())
										? dateValue
										: undefined
								}
								onSelect={date => {
									// Always pass Date object, not string
									onChange(date || undefined)
									setOpen(false)
								}}
								disabled={date =>
									minDate && maxDate ? date < minDate || date > maxDate : false
								}
								captionLayout="dropdown"
							/>
						</PopoverContent>
					</Popover>
				)
			}}
		</FormField>
	)
}
