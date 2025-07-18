'use client'
import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
	value?: string
	onChange: (date: string | undefined) => void
	disabled?: boolean
}

export function DatePicker({ value, onChange, disabled }: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					disabled={disabled}
					className={cn(
						'w-[240px] justify-start text-left font-normal',
						!value && 'text-muted-foreground',
					)}
				>
					<CalendarIcon />
					{value ? format(value, 'PPP') : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={value ? new Date(value) : undefined}
					onSelect={date => onChange(date?.toString())}
					disabled={disabled}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	)
}
