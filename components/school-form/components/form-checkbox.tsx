'use client'

import { FieldValues, FieldPath } from 'react-hook-form'
import { FormField } from './form-field'
import { BaseFieldProps } from '../types/form'
import { Checkbox } from '@/components/ui/checkbox'

interface FormCheckboxProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'placeholder'> {
	onChange?: (checked: boolean) => void // External onChange callback
}

export function FormCheckbox<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	onChange: externalOnChange, // Rename to avoid confusion
}: FormCheckboxProps<TFieldValues, TName>) {
	return (
		<FormField
			name={name}
			label={label}
			description={description}
			required={required}
			disabled={disabled}
		>
			{({ value, onChange: formOnChange, onBlur, disabled: fieldDisabled }) => (
				<div className="flex items-center space-x-2">
					<Checkbox
						id={name}
						checked={!!value}
						onCheckedChange={newChecked => {
							const finalChecked = !!newChecked

							// Update form state
							formOnChange(finalChecked)

							// Call external onChange if provided
							if (externalOnChange) {
								externalOnChange(finalChecked)
							}
						}}
						onBlur={onBlur}
						disabled={fieldDisabled}
					/>
					{label && (
						<label
							htmlFor={name}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{label}
							{required && <span className="text-red-500 ml-1">*</span>}
						</label>
					)}
				</div>
			)}
		</FormField>
	)
}
