'use client'

import { FieldValues, FieldPath } from 'react-hook-form'
import { FormField } from './form-field'
import { BaseFieldProps } from '../types/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface FormInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
	type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'decimal'
	returnAsNumber?: boolean
	currencySymbol?: string
	highlightNegative?: boolean
	// Controlled component props
	value?: any
	onChange?: (value: any) => void
	onBlur?: () => void
}

export function FormInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	placeholder,
	type = 'text',
	returnAsNumber = true,
	currencySymbol = '',
	highlightNegative = false,
	value: controlledValue,
	onChange: controlledOnChange,
	onBlur: controlledOnBlur,
}: FormInputProps<TFieldValues, TName>) {
	const [isFocused, setIsFocused] = React.useState(false)

	// Check if component is being used in controlled mode
	// Component is controlled if either value is provided OR onChange is provided
	const isControlled =
		controlledValue !== undefined || controlledOnChange !== undefined

	// Helper function to escape regex special characters
	const escapeRegExp = (string: string) => {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	}

	const getDecimalDisplayValue = (value: any): string => {
		if (value === null || value === undefined || value === '') {
			return '0'
		}

		if (isFocused) {
			if (typeof value === 'object' && value !== null && 'toString' in value) {
				return value.toString()
			}

			if (typeof value === 'string') {
				// Escape currency symbol for regex
				const escapedSymbol = escapeRegExp(currencySymbol)
				return value.replace(new RegExp(`^${escapedSymbol}`), '').trim()
			}

			return String(value)
		}

		let displayValue: string

		if (typeof value === 'object' && value !== null && 'toString' in value) {
			displayValue = value.toString()
		} else if (typeof value === 'string') {
			const escapedSymbol = escapeRegExp(currencySymbol)
			const hasSymbol = new RegExp(`^${escapedSymbol}`).test(value)
			displayValue = hasSymbol ? value : `${currencySymbol}${value}`
		} else {
			displayValue = `${currencySymbol}${value}`
		}

		return displayValue
	}

	const handleDecimalChange = (
		value: string,
		onChange: (value: any) => void,
	) => {
		if (!value) {
			onChange(returnAsNumber ? 0 : '0')
			return
		}

		if (value === '-') {
			onChange(value)
			return
		}

		if (value === '.') {
			onChange(returnAsNumber ? 0 : '0.')
			return
		}

		if (value === '0' || value === '0.') {
			if (value === '0.') {
				onChange(returnAsNumber ? 0 : '0.')
				return
			}

			if (/^[1-9]$/.test(value)) {
				onChange(returnAsNumber ? Number(value) : value)
				return
			}
		}

		const regex = /^-?\d*\.?\d*$/
		if (!regex.test(value)) {
			return
		}

		if (value !== '0' && !value.includes('.') && value.startsWith('0')) {
			const cleanedValue = value.replace(/^0+/, '') || '0'
			onChange(returnAsNumber ? Number(cleanedValue) : cleanedValue)
			return
		}

		if (returnAsNumber) {
			if (value.endsWith('.')) {
				onChange(value)
			} else {
				onChange(Number(value))
			}
		} else {
			onChange(value)
		}
	}

	const isNegative = (value: any) => {
		if (value === null || value === undefined || value === '') return false

		let stringValue: string
		if (typeof value === 'object' && value !== null && 'toString' in value) {
			stringValue = value.toString()
		} else {
			stringValue = String(value)
		}

		return stringValue.trim().startsWith('-')
	}

	// Render controlled input directly if in controlled mode
	if (isControlled) {
		if (type === 'decimal') {
			return (
				<div className="space-y-2">
					{label && (
						<label className="text-sm font-medium">
							{label}
							{required && <span className="text-red-500 ml-1">*</span>}
						</label>
					)}
					<Input
						type="text"
						inputMode="decimal"
						value={getDecimalDisplayValue(controlledValue)}
						onChange={e =>
							handleDecimalChange(
								e.target.value,
								controlledOnChange || (() => {}),
							)
						}
						onFocus={e => {
							setIsFocused(true)
							e.target.select()
						}}
						onBlur={e => {
							setIsFocused(false)
							controlledOnBlur?.()
						}}
						disabled={disabled}
						placeholder={placeholder}
						className={cn(
							isNegative(controlledValue) &&
								highlightNegative &&
								'text-red-500',
						)}
					/>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)
		}

		return (
			<div className="space-y-2">
				{label && (
					<label className="text-sm font-medium">
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}
				<Input
					type={type}
					value={controlledValue || ''}
					onChange={e => {
						const newValue =
							type === 'number' ? Number(e.target.value) : e.target.value
						controlledOnChange?.(newValue)
					}}
					onBlur={controlledOnBlur}
					disabled={disabled}
					placeholder={placeholder}
					className={cn(
						isNegative(controlledValue) && highlightNegative && 'text-red-500',
					)}
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
			{({ value, onChange, onBlur, disabled: fieldDisabled }) => {
				if (type === 'decimal') {
					return (
						<Input
							type="text"
							inputMode="decimal"
							value={getDecimalDisplayValue(value)}
							onChange={e => handleDecimalChange(e.target.value, onChange)}
							onFocus={e => {
								setIsFocused(true)
								e.target.select()
							}}
							onBlur={e => {
								setIsFocused(false)
								onBlur()
							}}
							disabled={fieldDisabled}
							placeholder={placeholder}
							className={cn(
								isNegative(value) && highlightNegative && 'text-red-500',
							)}
						/>
					)
				}

				return (
					<Input
						type={type}
						value={value || ''}
						onChange={e =>
							onChange(
								type === 'number' ? Number(e.target.value) : e.target.value,
							)
						}
						onBlur={onBlur}
						disabled={fieldDisabled}
						placeholder={placeholder}
						className={cn(
							isNegative(value) && highlightNegative && 'text-red-500',
						)}
					/>
				)
			}}
		</FormField>
	)
}
