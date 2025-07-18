'use client'

import { ReactNode } from 'react'
import { FieldValues } from 'react-hook-form'
import { useMultiStepFormContext } from '../contexts/form-context'
import { cn } from '@/lib/utils'

interface StepContentProps<T extends FieldValues = FieldValues> {
	stepId: string
	children: ReactNode
	className?: string
}

export function StepContent<T extends FieldValues = FieldValues>({
	stepId,
	children,
	className,
}: StepContentProps<T>) {
	const { steps, currentStep } = useMultiStepFormContext<T>()

	const currentStepData = steps[currentStep]
	const isCurrentStep = currentStepData?.id === stepId

	if (!isCurrentStep) {
		return null
	}

	return (
		<div className={cn('space-y-4', className)}>
			<div className="space-y-1">
				{currentStepData.label && (
					<h2 className="text-xl font-semibold">{currentStepData.label}</h2>
				)}
				{currentStepData.description && (
					<p className="text-sm text-muted-foreground">
						{currentStepData.description}
					</p>
				)}
			</div>
			<div className="space-y-4">{children}</div>
		</div>
	)
}
