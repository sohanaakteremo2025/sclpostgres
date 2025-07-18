'use client'

import { ReactNode } from 'react'
import { FieldValues, FieldPath, Controller } from 'react-hook-form'
import { useFormContext } from '../contexts/form-context'
import { BaseFieldProps } from '../types/form'
import { cn } from '@/lib/utils'

interface FormFieldProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
	children: (field: {
		value: any
		onChange: (value: any) => void
		onBlur: () => void
		disabled?: boolean
	}) => ReactNode
}

export function FormField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	children,
}: FormFieldProps<TFieldValues, TName>) {
	const { form } = useFormContext<TFieldValues>()

	return (
		<Controller
			control={form.control}
			name={name}
			render={({ field, fieldState }) => (
				<div className="space-y-2">
					{label && (
						<label
							htmlFor={String(name)}
							className={cn(
								'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
							)}
						>
							{label}
							{required && <span className="text-red-500 ml-1">*</span>}
						</label>
					)}
					<div className="relative">
						{children({
							value: field.value,
							onChange: field.onChange,
							onBlur: field.onBlur,
							disabled: disabled || form.formState.isSubmitting,
						})}
					</div>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
					{fieldState.error && (
						<p className="text-sm font-medium text-red-500">
							{fieldState.error.message}
						</p>
					)}
				</div>
			)}
		/>
	)
}
