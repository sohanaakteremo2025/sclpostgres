'use client'

import { useState } from 'react'
import { FieldValues, FieldPath } from 'react-hook-form'
import { FormField } from './form-field'
import { BaseFieldProps, SelectOption } from '../types/form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

// Enhanced SelectOption to support both string and number values
interface EnhancedSelectOption {
	value: string | number
	label: string
	disabled?: boolean
}

interface FormComboboxProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
	options: SelectOption[] | EnhancedSelectOption[]
	emptyText?: string
	searchPlaceholder?: string
	isLoading?: boolean
	loadingText?: string
	// Controlled component props
	value?: string | number | (string | number)[]
	onChange?: (value: string | number | (string | number)[] | any) => void
	onBlur?: () => void
	// New prop to return number instead of string
	returnAsNumber?: boolean
	// Combobox specific props
	width?: string
	allowClear?: boolean
	// Multi-select props
	multiple?: boolean
	maxSelection?: number
	showBadges?: boolean
	badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function FormSelect<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	placeholder = 'Select option...',
	options,
	emptyText = 'No options available',
	searchPlaceholder = 'Search...',
	isLoading = false,
	loadingText = 'Loading options...',
	value: controlledValue,
	onChange: controlledOnChange,
	onBlur: controlledOnBlur,
	returnAsNumber = false,
	width = 'w-full',
	allowClear = true,
	multiple = false,
	maxSelection,
	showBadges = true,
	badgeVariant = 'secondary',
}: FormComboboxProps<TFieldValues, TName>) {
	const [open, setOpen] = useState(false)
	const isDisabled = disabled || isLoading

	// Check if component is being used in controlled mode
	const isControlled = controlledValue !== undefined

	// Helper function to convert string to appropriate type
	const convertValue = (stringValue: string): string | number => {
		if (stringValue === '' || stringValue === '__clear__') {
			return returnAsNumber ? 0 : ''
		}

		if (returnAsNumber) {
			const numValue = Number(stringValue)
			return isNaN(numValue) ? 0 : numValue
		}

		return stringValue
	}

	// Helper function to convert value to string for comparison
	const valueToString = (value: string | number | undefined): string => {
		if (value === undefined || value === null) return ''
		return String(value)
	}

	// Helper function to ensure array for multi-select
	const ensureArray = (value: any): (string | number)[] => {
		if (value === undefined || value === null) return []
		if (Array.isArray(value)) return value
		return [value]
	}

	// Helper function to get empty value based on mode
	const getEmptyValue = () => {
		if (multiple) return []
		return returnAsNumber ? 0 : ''
	}

	// Helper function to create unique command value
	const createCommandValue = (option: any, index: number): string => {
		// Create a unique identifier using value, label, and index
		return `${option.value}|||${option.label}|||${index}`
	}

	// Helper function to parse command value back to option value
	const parseCommandValue = (commandValue: string): string => {
		if (commandValue === '__clear__') return '__clear__'
		const parts = commandValue.split('|||')
		return parts[0] || commandValue
	}

	// Normalize options to ensure all values are strings for comparison
	const normalizedOptions = useMemo(
		() =>
			options?.map((option, index) => ({
				...option,
				value: String(option.value),
				originalValue: option.value,
				commandValue: createCommandValue(option, index), // Unique identifier for Command component
			})) || [],
		[options],
	)

	// Find selected option labels for multi-select
	const getSelectedOptions = (currentValue: any) => {
		if (!multiple) {
			const stringValue = valueToString(currentValue)
			return normalizedOptions?.filter(opt => opt.value === stringValue) || []
		}

		const valueArray = ensureArray(currentValue)
		return (
			normalizedOptions?.filter(opt =>
				valueArray.some(val => valueToString(val) === opt.value),
			) || []
		)
	}

	// Get display text for trigger button
	const getSelectedLabel = (currentValue: any) => {
		if (!multiple) {
			// Single select logic (existing)
			if (currentValue === undefined || currentValue === null)
				return placeholder
			if (currentValue === '' && !returnAsNumber) return placeholder
			if (
				currentValue === 0 &&
				returnAsNumber &&
				!normalizedOptions?.find(opt => opt.value === '0')
			)
				return placeholder

			const stringValue = String(currentValue)
			const option = normalizedOptions?.find(opt => opt.value === stringValue)
			return option?.label || placeholder
		}

		// Multi-select logic
		const selectedOptions = getSelectedOptions(currentValue)
		if (selectedOptions.length === 0) return placeholder
		if (selectedOptions.length === 1) return selectedOptions[0].label
		return `${selectedOptions.length} items selected`
	}

	// Handle option selection for both single and multi-select
	const handleSelect = (
		selectedCommandValue: string,
		onChange: (value: any) => void,
		currentValue: any,
	) => {
		if (selectedCommandValue === '__clear__') {
			onChange(getEmptyValue())
			setOpen(false)
			return
		}

		// Parse the command value to get the actual option value
		const actualValue = parseCommandValue(selectedCommandValue)

		// Find the option by the parsed value
		const selectedOption = normalizedOptions.find(
			opt => opt.value === actualValue,
		)
		if (!selectedOption) return

		if (!multiple) {
			// Single select logic (existing)
			const stringCurrentValue = valueToString(currentValue)
			const shouldClear = actualValue === stringCurrentValue

			if (shouldClear) {
				onChange(getEmptyValue())
			} else {
				const convertedValue = convertValue(actualValue)
				onChange(convertedValue)
			}
			setOpen(false)
		} else {
			// Multi-select logic
			const currentArray = ensureArray(currentValue)
			const convertedSelectedValue = convertValue(actualValue)

			// Check if item is already selected
			const isSelected = currentArray.some(
				val => valueToString(val) === actualValue,
			)

			let newArray: (string | number)[]

			if (isSelected) {
				// Remove item
				newArray = currentArray.filter(
					val => valueToString(val) !== actualValue,
				)
			} else {
				// Add item (check max selection)
				if (maxSelection && currentArray.length >= maxSelection) {
					return // Don't add if max reached
				}
				newArray = [...currentArray, convertedSelectedValue]
			}

			onChange(newArray)
			// Keep open for multi-select
		}
	}

	// Handle removing individual items in multi-select
	const handleRemoveItem = (
		itemValue: string | number,
		onChange: (value: any) => void,
		currentValue: any,
	) => {
		const currentArray = ensureArray(currentValue)
		const newArray = currentArray.filter(
			val => valueToString(val) !== valueToString(itemValue),
		)
		onChange(newArray)
	}

	// Check if value is selected (for multi-select checkmarks)
	const isOptionSelected = (optionValue: string, currentValue: any) => {
		if (!multiple) {
			return valueToString(currentValue) === optionValue
		}

		const currentArray = ensureArray(currentValue)
		return currentArray.some(val => valueToString(val) === optionValue)
	}

	// Render badges for multi-select
	const renderBadges = (currentValue: any, onChange: (value: any) => void) => {
		if (!multiple || !showBadges) return null

		const selectedOptions = getSelectedOptions(currentValue)
		if (selectedOptions.length === 0) return null

		return (
			<div className="flex flex-wrap gap-1 mt-2">
				{selectedOptions.map(option => (
					<Badge
						key={option.commandValue} // Use unique commandValue as key
						variant={badgeVariant}
						className="flex items-center gap-1"
					>
						{option.label}
						<X
							className="h-3 w-3 cursor-pointer hover:text-destructive"
							onClick={e => {
								e.preventDefault()
								e.stopPropagation()
								handleRemoveItem(option.originalValue, onChange, currentValue)
							}}
						/>
					</Badge>
				))}
			</div>
		)
	}

	// Check if we should show clear option
	const shouldShowClear = (currentValue: any) => {
		if (!allowClear) return false

		if (!multiple) {
			return (
				currentValue !== undefined &&
				currentValue !== (returnAsNumber ? 0 : '') &&
				currentValue !== ''
			)
		}

		const currentArray = ensureArray(currentValue)
		return currentArray.length > 0
	}

	// Render controlled combobox directly if in controlled mode
	if (isControlled) {
		return (
			<div className="space-y-2">
				{label && (
					<label className="text-sm font-medium">
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className={cn(width, 'justify-between')}
							disabled={isDisabled}
							onBlur={controlledOnBlur}
						>
							{isLoading ? (
								<div className="flex items-center">
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									{loadingText}
								</div>
							) : (
								<span className="truncate">
									{getSelectedLabel(controlledValue)}
								</span>
							)}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className={cn(width, 'p-0')}>
						<Command>
							<CommandInput placeholder={searchPlaceholder} className="h-9" />
							<CommandList>
								{isLoading ? (
									<CommandEmpty>
										<div className="flex items-center justify-center py-6">
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											{loadingText}
										</div>
									</CommandEmpty>
								) : (
									<CommandEmpty>{emptyText}</CommandEmpty>
								)}
								<CommandGroup>
									{/* Clear option */}
									{shouldShowClear(controlledValue) && (
										<CommandItem
											value="__clear__"
											onSelect={() =>
												handleSelect(
													'__clear__',
													controlledOnChange!,
													controlledValue,
												)
											}
											className="text-muted-foreground"
										>
											Clear {multiple ? 'all' : 'selection'}
										</CommandItem>
									)}
									{!isLoading &&
										normalizedOptions?.map(option => {
											const isSelected = isOptionSelected(
												option.value,
												controlledValue,
											)
											const isMaxReached =
												multiple &&
												maxSelection &&
												ensureArray(controlledValue).length >= maxSelection &&
												!isSelected

											return (
												<CommandItem
													key={option.commandValue} // Use unique commandValue as key
													value={option.commandValue} // Use unique commandValue for Command
													onSelect={selectedCommandValue =>
														handleSelect(
															selectedCommandValue,
															controlledOnChange!,
															controlledValue,
														)
													}
													disabled={
														(option.disabled || isMaxReached) as boolean
													}
													className={cn(
														isMaxReached && 'opacity-50 cursor-not-allowed',
													)}
												>
													{option.label}
													{maxSelection && multiple && !isSelected && (
														<span className="ml-auto text-xs text-muted-foreground">
															{ensureArray(controlledValue).length}/
															{maxSelection}
														</span>
													)}
													<Check
														className={cn(
															'ml-auto h-4 w-4',
															isSelected ? 'opacity-100' : 'opacity-0',
														)}
													/>
												</CommandItem>
											)
										})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				{/* Render badges for controlled mode */}
				{renderBadges(controlledValue, controlledOnChange!)}

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
			disabled={isDisabled}
		>
			{({ value, onChange: formOnChange, onBlur, disabled: fieldDisabled }) => {
				// Enhanced onChange handler to call both form and custom onChange
				const handleFormOnChange = (newValue: any) => {
					// Always call form onChange first
					formOnChange(newValue)
					// Then call custom onChange if provided
					if (controlledOnChange) {
						controlledOnChange(newValue)
					}
				}

				// Use controlled props if provided, otherwise use form props
				const finalValue =
					controlledValue !== undefined ? controlledValue : value
				const finalOnChange = handleFormOnChange
				const finalOnBlur = controlledOnBlur || onBlur

				return (
					<div className="space-y-2">
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className={cn(width, 'justify-between')}
									disabled={fieldDisabled || isLoading}
									onBlur={finalOnBlur}
								>
									{isLoading ? (
										<div className="flex items-center">
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											{loadingText}
										</div>
									) : (
										<span className="truncate">
											{getSelectedLabel(finalValue)}
										</span>
									)}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className={cn(width, 'p-0')}>
								<Command>
									<CommandInput
										placeholder={searchPlaceholder}
										className="h-9"
									/>
									<CommandList>
										{isLoading ? (
											<CommandEmpty>
												<div className="flex items-center justify-center py-6">
													<Loader2 className="h-4 w-4 animate-spin mr-2" />
													{loadingText}
												</div>
											</CommandEmpty>
										) : (
											<CommandEmpty>{emptyText}</CommandEmpty>
										)}
										<CommandGroup>
											{/* Clear option */}
											{shouldShowClear(finalValue) && (
												<CommandItem
													value="__clear__"
													onSelect={() =>
														handleSelect('__clear__', finalOnChange, finalValue)
													}
													className="text-muted-foreground"
												>
													Clear {multiple ? 'all' : 'selection'}
												</CommandItem>
											)}
											{!isLoading &&
												normalizedOptions?.map(option => {
													const isSelected = isOptionSelected(
														option.value,
														finalValue,
													)
													const isMaxReached =
														multiple &&
														maxSelection &&
														ensureArray(finalValue).length >= maxSelection &&
														!isSelected

													return (
														<CommandItem
															key={option.commandValue} // Use unique commandValue as key
															value={option.commandValue} // Use unique commandValue for Command
															onSelect={selectedCommandValue =>
																handleSelect(
																	selectedCommandValue,
																	finalOnChange,
																	finalValue,
																)
															}
															disabled={
																(option.disabled || isMaxReached) as boolean
															}
															className={cn(
																isMaxReached && 'opacity-50 cursor-not-allowed',
															)}
														>
															{option.label}
															{maxSelection && multiple && !isSelected && (
																<span className="ml-auto text-xs text-muted-foreground">
																	{ensureArray(finalValue).length}/
																	{maxSelection}
																</span>
															)}
															<Check
																className={cn(
																	'ml-auto h-4 w-4',
																	isSelected ? 'opacity-100' : 'opacity-0',
																)}
															/>
														</CommandItem>
													)
												})}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>

						{/* Render badges */}
						{renderBadges(finalValue, finalOnChange)}
					</div>
				)
			}}
		</FormField>
	)
}
