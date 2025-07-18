'use client'

import { ReactNode, useState, useMemo, useEffect, useCallback } from 'react'
import {
	FieldValues,
	useForm,
	UseFormProps,
	FormProvider as RHFFormProvider,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MultiStepFormContext } from '../contexts/form-context'
import {
	FormStep,
	MultiStepFormContextValue,
	FormAction,
	FormActionState,
} from '../types/form'
import { useFormDefaults } from '../hooks/use-form-defaults'

interface MultiStepFormProviderProps<T extends FieldValues> {
	children: ReactNode
	schema: z.ZodSchema<T>
	steps: FormStep<T>[]
	onSubmit: FormAction<T>
	defaultValues?: Partial<T>
	fetchDefaults?: () => Promise<Partial<T>>
	formOptions?: Omit<UseFormProps<T>, 'resolver' | 'defaultValues'>
	onSuccess?: (data: T, result: FormActionState) => void
	onError?: (errors: Record<string, string[]>) => void
	onStepChange?: (currentStep: number, direction: 'next' | 'previous') => void
	// New props for persistence
	persistenceKey?: string // Unique key for this form's data
	enablePersistence?: boolean // Toggle persistence on/off
	storage?: 'localStorage' | 'sessionStorage' // Storage type
	disablePersistenceWhenDefaults?: boolean // Disable persistence when defaultValues are provided
	// New loading prop
	isLoading?: boolean // External loading state to wait for before setting defaults
	loadingMessage?: string // Custom loading message
}

interface PersistedFormData<T> {
	formData: Partial<T>
	currentStep: number
	timestamp: number
}

export function MultiStepFormProvider<T extends FieldValues>({
	children,
	schema,
	steps,
	onSubmit,
	defaultValues,
	fetchDefaults,
	formOptions,
	onSuccess,
	onError,
	onStepChange,
	persistenceKey = 'multistep-form',
	enablePersistence = true,
	storage = 'localStorage',
	disablePersistenceWhenDefaults = true,
	isLoading = false,
	loadingMessage = 'Loading form data...',
}: MultiStepFormProviderProps<T>) {
	const [currentStep, setCurrentStep] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Check if we should enable persistence
	const shouldPersist =
		enablePersistence &&
		!(
			disablePersistenceWhenDefaults &&
			defaultValues &&
			Object.keys(defaultValues).length > 0
		)

	// Save data to storage
	const saveToStorage = useCallback(
		(formData: Partial<T>, step: number) => {
			if (!shouldPersist) return

			try {
				const storageObj =
					storage === 'localStorage'
						? typeof window !== 'undefined'
							? window.localStorage
							: null
						: typeof window !== 'undefined'
							? window.sessionStorage
							: null

				if (!storageObj) return

				const dataToSave: PersistedFormData<T> = {
					formData,
					currentStep: step,
					timestamp: Date.now(),
				}
				storageObj.setItem(persistenceKey, JSON.stringify(dataToSave))
			} catch (error) {
				console.warn('Failed to save form data to storage:', error)
			}
		},
		[shouldPersist, storage, persistenceKey],
	)

	// Load data from storage
	const loadFromStorage = useCallback((): PersistedFormData<T> | null => {
		if (!shouldPersist) return null

		try {
			const storageObj =
				storage === 'localStorage'
					? typeof window !== 'undefined'
						? window.localStorage
						: null
					: typeof window !== 'undefined'
						? window.sessionStorage
						: null

			if (!storageObj) return null

			const savedData = storageObj.getItem(persistenceKey)
			if (!savedData) return null

			const parsed: PersistedFormData<T> = JSON.parse(savedData)

			// Optionally add expiration check (e.g., 24 hours)
			const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000
			if (isExpired) {
				storageObj.removeItem(persistenceKey)
				return null
			}

			return parsed
		} catch (error) {
			console.warn('Failed to load form data from storage:', error)
			return null
		}
	}, [shouldPersist, storage, persistenceKey])

	// Clear storage data
	const clearStorage = useCallback(() => {
		try {
			const storageObj =
				storage === 'localStorage'
					? typeof window !== 'undefined'
						? window.localStorage
						: null
					: typeof window !== 'undefined'
						? window.sessionStorage
						: null

			if (storageObj) {
				storageObj.removeItem(persistenceKey)
			}
		} catch (error) {
			console.warn('Failed to clear storage:', error)
		}
	}, [storage, persistenceKey])

	// Initialize form with just the provided default values first
	const form = useForm<T>({
		resolver: zodResolver(schema),
		defaultValues: defaultValues as any,
		mode: 'onChange',
		...formOptions,
	})

	// Load default values with schema for date transformation
	const { isLoading: isLoadingDefaults } = useFormDefaults({
		form,
		fetchDefaults,
		defaultValues,
		schema,
		enabled: !isLoading, // Don't load defaults while external loading is true
	})

	// Load and merge persisted data after form is initialized
	useEffect(() => {
		if (!isLoadingDefaults && !isLoading && shouldPersist) {
			const savedData = loadFromStorage()
			if (savedData) {
				// Merge saved data with current form values
				const mergedData = {
					...form.getValues(),
					...savedData.formData,
				}

				// Reset form with merged data
				form.reset(mergedData as any)
				setCurrentStep(savedData.currentStep)
			}
		}
	}, [isLoadingDefaults, isLoading, shouldPersist])

	// Watch form values and save to storage (only after initial load)
	const watchedValues = form.watch()
	const [isInitialized, setIsInitialized] = useState(false)

	// Mark as initialized after loading is complete
	useEffect(() => {
		if (!isLoadingDefaults && !isLoading) {
			const timer = setTimeout(() => {
				setIsInitialized(true)
			}, 100) // Small delay to ensure form is fully initialized
			return () => clearTimeout(timer)
		}
	}, [isLoadingDefaults, isLoading])

	useEffect(() => {
		if (isInitialized && shouldPersist) {
			// Debounce saving to avoid too frequent updates
			const timeoutId = setTimeout(() => {
				saveToStorage(watchedValues, currentStep)
			}, 500)

			return () => clearTimeout(timeoutId)
		}
	}, [watchedValues, currentStep, isInitialized, shouldPersist])

	const currentStepData = steps[currentStep]
	const isFirstStep = currentStep === 0
	const isLastStep = currentStep === steps.length - 1

	// Validate current step fields
	// Update the canGoNext validation logic in MultiStepFormProvider
	const canGoNext = useMemo(() => {
		if (!currentStepData) return false

		// For optional steps, always allow progression
		if (currentStepData.isOptional) return true

		const stepFields = currentStepData.fields
		const optionalFields = currentStepData.optionalFields || []
		const formErrors = form.formState.errors

		// Check if all required fields in current step are filled and valid
		return stepFields.every(field => {
			const fieldKey = field as string
			const hasError = fieldKey in formErrors
			const fieldValue = watchedValues[fieldKey]
			const hasValue =
				fieldValue !== undefined && fieldValue !== '' && fieldValue !== null

			// If field is optional, only check for errors, not required value
			if (optionalFields.includes(field)) {
				return !hasError
			}

			// For required fields, check both error and value
			return !hasError && hasValue
		})
	}, [currentStepData, form.formState.errors, watchedValues])

	const canGoPrevious = currentStep > 0

	const goToStep = (step: number) => {
		if (step >= 0 && step < steps.length) {
			setCurrentStep(step)
			// Save immediately when step changes
			if (shouldPersist) {
				setTimeout(() => {
					saveToStorage(form.getValues(), step)
				}, 0)
			}
		}
	}

	const nextStep = async () => {
		if (!canGoNext || isLastStep) return

		// Validate current step if it has specific validation
		if (currentStepData.validation) {
			const stepValues = Object.fromEntries(
				currentStepData.fields.map(field => [
					field,
					form.getValues(field as any),
				]),
			)

			const result = await currentStepData.validation.safeParseAsync(stepValues)
			if (!result.success) {
				// Set validation errors for current step
				result.error.errors.forEach(error => {
					const fieldName = error.path[0] as keyof T
					form.setError(fieldName as any, {
						type: 'validation',
						message: error.message,
					})
				})
				return
			}
		}

		const newStep = currentStep + 1
		setCurrentStep(newStep)
		onStepChange?.(newStep, 'next')

		// Save immediately when step changes
		if (shouldPersist) {
			setTimeout(() => {
				saveToStorage(form.getValues(), newStep)
			}, 0)
		}
	}

	const previousStep = () => {
		if (!canGoPrevious) return

		const newStep = currentStep - 1
		setCurrentStep(newStep)
		onStepChange?.(newStep, 'previous')

		// Save immediately when step changes
		if (shouldPersist) {
			setTimeout(() => {
				saveToStorage(form.getValues(), newStep)
			}, 0)
		}
	}

	const getStepStatus = (
		stepIndex: number,
	): 'completed' | 'current' | 'upcoming' => {
		if (stepIndex < currentStep) return 'completed'
		if (stepIndex === currentStep) return 'current'
		return 'upcoming'
	}

	const handleSubmit = async (data: T) => {
		try {
			setIsSubmitting(true)
			const result = await onSubmit(data)

			if (result.success) {
				// Clear storage only on successful submission
				if (shouldPersist) {
					clearStorage()
				}
				onSuccess?.(data, result)
			} else {
				if (result.errors) {
					// Set server validation errors
					Object.entries(result.errors).forEach(([field, messages]) => {
						form.setError(field as any, {
							type: 'server',
							message: messages[0],
						})
					})
					onError?.(result.errors)
				}
			}
		} catch (error) {
			console.error('Form submission error:', error)
			form.setError('root', {
				type: 'server',
				message: 'An unexpected error occurred',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	// Method to manually clear persisted data
	const clearPersistedData = useCallback(() => {
		clearStorage()
		form.reset(defaultValues as any)
		setCurrentStep(0)
		setIsInitialized(false)
		// Re-initialize after a brief delay
		setTimeout(() => setIsInitialized(true), 100)
	}, [clearStorage, form, defaultValues])

	// Method to check if there's persisted data
	const hasPersistedData = useCallback(() => {
		if (!shouldPersist) return false

		try {
			const storageObj =
				storage === 'localStorage'
					? typeof window !== 'undefined'
						? window.localStorage
						: null
					: typeof window !== 'undefined'
						? window.sessionStorage
						: null

			if (!storageObj) return false

			const savedData = storageObj.getItem(persistenceKey)
			return savedData !== null
		} catch (error) {
			return false
		}
	}, [shouldPersist, storage, persistenceKey])

	const contextValue: MultiStepFormContextValue<T> & {
		clearPersistedData: () => void
		hasPersistedData: () => boolean
		isRestoringData: boolean
	} = {
		form,
		schema,
		isSubmitting: isSubmitting || isLoadingDefaults || isLoading,
		onSubmit: handleSubmit,
		steps,
		currentStep,
		isFirstStep,
		isLastStep,
		canGoNext,
		canGoPrevious,
		goToStep,
		nextStep,
		previousStep,
		getStepStatus,
		// New methods for persistence
		clearPersistedData,
		hasPersistedData,
		isRestoringData: !isInitialized || isLoading,
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
		<RHFFormProvider {...form}>
			<MultiStepFormContext.Provider value={contextValue as any}>
				{children}
			</MultiStepFormContext.Provider>
		</RHFFormProvider>
	)
}
