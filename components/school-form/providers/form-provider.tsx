'use client'

import { ReactNode, useState } from 'react'
import { FieldValues, useForm, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormContext } from '../contexts/form-context'
import { FormContextValue, FormAction, FormActionState } from '../types/form'
import { useFormDefaults } from '../hooks/use-form-defaults'
import { toast } from 'sonner'

interface FormProviderProps<T extends FieldValues> {
	children: ReactNode
	schema: z.ZodSchema<T>
	onSubmit: FormAction<T>
	defaultValues?: Partial<T>
	fetchDefaults?: () => Promise<Partial<T>>
	formOptions?: Omit<UseFormProps<T>, 'resolver' | 'defaultValues'>
	onSuccess?: (data: T, result: FormActionState) => void
	onError?: (errors: Record<string, string[]>) => void
	// New loading props
	isLoading?: boolean // External loading state to wait for before setting defaults
	loadingMessage?: string // Custom loading message
}

export function FormProvider<T extends FieldValues>({
	children,
	schema,
	onSubmit,
	defaultValues,
	fetchDefaults,
	formOptions,
	onSuccess,
	onError,
	isLoading = false,
	loadingMessage = 'Loading form data...',
}: FormProviderProps<T>) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<T>({
		resolver: zodResolver(schema),
		defaultValues: defaultValues as any,
		mode: 'onChange',
		...formOptions,
	})

	// Load default values with schema for intelligent transformation
	const { isLoading: isLoadingDefaults } = useFormDefaults({
		form,
		fetchDefaults,
		defaultValues,
		schema,
		enabled: !isLoading, // Don't load defaults while external loading is true
	})

	const handleSubmit = async (data: T) => {
		try {
			setIsSubmitting(true)
			const result = await onSubmit(data)

			if (result.success) {
				toast.success(result.message)
				onSuccess?.(data, result)
			} else {
				if (result.errors) {
					toast.error(result.message)
					// Set server validation errors
					Object.entries(result.errors).forEach(([field, messages]) => {
						form.setError(field as any, {
							type: 'server',
							message: messages[0],
						})
					})
					onError?.(result.errors)
				}
				toast.error(result.message)
			}
		} catch (error) {
			console.error('Form submission error:', error)
			form.setError('root', {
				type: 'server',
				message: 'An unexpected error occurred',
			})
			toast.error('An unexpected error occurred')
		} finally {
			setIsSubmitting(false)
		}
	}

	const contextValue: FormContextValue<T> = {
		form,
		schema,
		isSubmitting: isSubmitting || isLoadingDefaults || isLoading,
		onSubmit: handleSubmit,
	}

	// Show loading state if external dependencies are loading
	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="flex flex-col items-center gap-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<p className="text-sm text-gray-600">{loadingMessage}</p>
				</div>
			</div>
		)
	}

	return (
		<FormContext.Provider value={contextValue as any}>
			{children}
		</FormContext.Provider>
	)
}
