'use client'

import { FieldValues, Path } from 'react-hook-form'
import { FormField } from './form-field'
import { CascadeSelectProps } from '../types/form'
import { useCascadeSelect } from '../hooks/use-cascade-select'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function CascadeSelect<
	TFieldValues extends FieldValues = FieldValues,
	TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	placeholder,
	dependsOn,
	options,
	loadingText = 'Loading...',
}: CascadeSelectProps<TFieldValues, TName | Path<TFieldValues>>) {
	const {
		options: selectOptions,
		isLoading,
		error,
	} = useCascadeSelect({
		name,
		dependsOn,
		options,
	})

	return (
		<FormField
			name={name}
			label={label}
			description={description}
			required={required}
			disabled={disabled}
		>
			{({ value, onChange, onBlur, disabled: fieldDisabled }) => (
				<Select
					value={value || undefined}
					onValueChange={newValue => {
						// Handle clearing selection
						onChange(newValue === '__clear__' ? '' : newValue)
					}}
					disabled={fieldDisabled || isLoading}
				>
					<SelectTrigger onBlur={onBlur}>
						<SelectValue placeholder={placeholder} />
						{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
					</SelectTrigger>
					<SelectContent>
						{/* Clear option when there's a value */}
						{value && !isLoading && (
							<SelectItem value="__clear__" className="text-muted-foreground">
								Clear selection
							</SelectItem>
						)}
						{isLoading ? (
							<SelectItem value="__loading__" disabled>
								{loadingText}
							</SelectItem>
						) : error ? (
							<SelectItem value="__error__" disabled>
								Error loading options
							</SelectItem>
						) : selectOptions.length === 0 ? (
							<SelectItem value="__empty__" disabled>
								{dependsOn
									? 'Select parent option first'
									: 'No options available'}
							</SelectItem>
						) : (
							selectOptions.map(option => (
								<SelectItem
									key={option.value}
									value={option.value}
									disabled={option.disabled}
								>
									{option.label}
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
			)}
		</FormField>
	)
}
