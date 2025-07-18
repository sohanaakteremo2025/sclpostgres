'use client'

import { ReactNode } from 'react'
import { FieldValues } from 'react-hook-form'
import { useMultiStepFormContext } from '../contexts/form-context'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepNavigationProps<T extends FieldValues = FieldValues> {
	className?: string
	previousLabel?: string
	nextLabel?: string
	submitLabel?: string
	submitLoadingLabel?: string
	showStepInfo?: boolean
	customPreviousButton?: ReactNode
	customNextButton?: ReactNode
	customSubmitButton?: ReactNode
}

export function StepNavigation<T extends FieldValues = FieldValues>({
	className,
	previousLabel = 'Previous',
	nextLabel = 'Next',
	submitLabel = 'Submit',
	submitLoadingLabel = 'Submitting...',
	showStepInfo = true,
	customPreviousButton,
	customNextButton,
	customSubmitButton,
}: StepNavigationProps<T>) {
	const {
		steps,
		currentStep,
		isFirstStep,
		isLastStep,
		canGoNext,
		canGoPrevious,
		nextStep,
		previousStep,
		isSubmitting,
		form,
		onSubmit,
	} = useMultiStepFormContext<T>()

	// Handle submit button click - this should actually submit the form
	const handleSubmit = async () => {
		const formData = form.getValues()
		await onSubmit(formData)
	}

	const renderPreviousButton = () => {
		if (customPreviousButton) {
			return customPreviousButton
		}

		return (
			<Button
				type="button"
				variant="outline"
				onClick={previousStep}
				disabled={!canGoPrevious || isSubmitting}
				className="flex items-center gap-2"
			>
				<ChevronLeft className="w-4 h-4" />
				{previousLabel}
			</Button>
		)
	}

	const renderNextButton = () => {
		if (customNextButton) {
			return customNextButton
		}

		return (
			<Button
				type="button"
				onClick={nextStep}
				disabled={!canGoNext || isSubmitting}
				className="flex items-center gap-2"
			>
				{nextLabel}
				<ChevronRight className="w-4 h-4" />
			</Button>
		)
	}

	const renderSubmitButton = () => {
		if (customSubmitButton) {
			return customSubmitButton
		}

		return (
			<Button
				type="button"
				onClick={handleSubmit}
				disabled={!canGoNext || isSubmitting}
				className="flex items-center gap-2"
			>
				{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
				{isSubmitting ? submitLoadingLabel : submitLabel}
			</Button>
		)
	}

	return (
		<div className={cn('flex items-center justify-between pt-6', className)}>
			<div className="flex items-center gap-4">
				{!isFirstStep && renderPreviousButton()}
			</div>

			{showStepInfo && (
				<div className="text-sm text-muted-foreground">
					Step {currentStep + 1} of {steps.length}
				</div>
			)}

			<div className="flex items-center gap-4">
				{isLastStep ? renderSubmitButton() : renderNextButton()}
			</div>
		</div>
	)
}
