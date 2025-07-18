'use client'

import { FieldValues, FieldPath } from 'react-hook-form'
import { FormField } from './form-field'
import { BaseFieldProps } from '../types/form'
import { Textarea } from '@/components/ui/textarea'
import * as React from 'react'

interface FormTextareaProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
	rows?: number
	// Controlled component props
	value?: string
	onChange?: (value: string) => void
	onBlur?: () => void
}

export function FormTextarea<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	placeholder,
	rows = 3,
	value: controlledValue,
	onChange: controlledOnChange,
	onBlur: controlledOnBlur,
}: FormTextareaProps<TFieldValues, TName>) {
	// Check if component is being used in controlled mode
	const isControlled =
		controlledValue !== undefined && controlledOnChange !== undefined

	// Render controlled textarea directly if in controlled mode
	if (isControlled) {
		return (
			<div className="space-y-2">
				{label && (
					<label className="text-sm font-medium">
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}
				<Textarea
					value={controlledValue || ''}
					onChange={e => controlledOnChange(e.target.value)}
					onBlur={controlledOnBlur}
					disabled={disabled}
					placeholder={placeholder}
					rows={rows}
				/>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
		)
	}

	// Render form field wrapper for form usage
	return (
		<FormField
			name={name}
			label={label}
			description={description}
			required={required}
			disabled={disabled}
		>
			{({ value, onChange, onBlur, disabled: fieldDisabled }) => (
				<Textarea
					value={value || ''}
					onChange={e => onChange(e.target.value)}
					onBlur={onBlur}
					disabled={fieldDisabled}
					placeholder={placeholder}
					rows={rows}
				/>
			)}
		</FormField>
	)
}
