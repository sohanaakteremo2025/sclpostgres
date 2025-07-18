import { z } from 'zod'
import { FieldPath, FieldValues, UseFormReturn, Path } from 'react-hook-form'

// Base form types
export interface FormContextValue<T extends FieldValues = FieldValues> {
	form: UseFormReturn<T>
	schema: z.ZodSchema<T>
	isSubmitting: boolean
	onSubmit: (data: T) => Promise<void> | void
}

// Field component props
export interface BaseFieldProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	name: TName
	label?: string
	description?: string
	required?: boolean
	disabled?: boolean
	placeholder?: string
}

// Select option type
export interface SelectOption {
	value: string
	label: string
	disabled?: boolean
}

// Cascaded select types with more flexible typing
export interface CascadeSelectProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
	name: TName
	label?: string
	description?: string
	required?: boolean
	disabled?: boolean
	placeholder?: string
	dependsOn?: Path<TFieldValues>
	options: SelectOption[] | ((dependentValue: any) => Promise<SelectOption[]>)
	loadingText?: string
}

// Multistep form types
export interface FormStep<T extends FieldValues = FieldValues> {
	id: string
	title?: string
	label?: string
	description?: string
	fields: (keyof T)[]
	validation?: z.ZodSchema<Partial<T>>
	optionalFields?: (keyof T)[]
	isOptional?: boolean
}

export interface MultiStepFormContextValue<T extends FieldValues = FieldValues>
	extends FormContextValue<T> {
	steps: FormStep<T>[]
	currentStep: number
	isFirstStep: boolean
	isLastStep: boolean
	canGoNext: boolean
	canGoPrevious: boolean
	goToStep: (step: number) => void
	nextStep: () => void
	previousStep: () => void
	getStepStatus: (stepIndex: number) => 'completed' | 'current' | 'upcoming'
}

// Server action types
export interface FormActionState {
	success: boolean
	message?: string
	errors?: Record<string, string[]>
}

export type FormAction<T extends FieldValues = FieldValues> = (
	data: T,
) => Promise<FormActionState>
