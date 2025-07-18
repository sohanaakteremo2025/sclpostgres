'use client'

import { createContext, useContext } from 'react'
import { FieldValues } from 'react-hook-form'
import { FormContextValue, MultiStepFormContextValue } from '../types/form'

// Single step form context
export const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext<
	T extends FieldValues = FieldValues,
>(): FormContextValue<T> {
	const singleStepContext = useContext(FormContext)
	const multiStepContext = useContext(MultiStepFormContext)

	const context = singleStepContext || multiStepContext

	if (!context) {
		throw new Error(
			'useFormContext must be used within a FormProvider or MultiStepFormProvider',
		)
	}
	return context as FormContextValue<T>
}

// Multi-step form context
export const MultiStepFormContext =
	createContext<MultiStepFormContextValue | null>(null)

export function useMultiStepFormContext<
	T extends FieldValues = FieldValues,
>(): MultiStepFormContextValue<T> {
	const context = useContext(MultiStepFormContext)
	if (!context) {
		throw new Error(
			'useMultiStepFormContext must be used within a MultiStepFormProvider',
		)
	}
	return context as MultiStepFormContextValue<T>
}
