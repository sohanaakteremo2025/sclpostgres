'use client'

import { FieldValues } from 'react-hook-form'
import { useMultiStepFormContext } from '../contexts/form-context'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepIndicatorProps<T extends FieldValues = FieldValues> {
	className?: string
	clickable?: boolean
}

export function StepIndicator<T extends FieldValues = FieldValues>({
	className,
	clickable = false,
}: StepIndicatorProps<T>) {
	const { steps, currentStep, getStepStatus, goToStep } =
		useMultiStepFormContext<T>()

	return (
		<nav className={cn('flex items-center justify-center', className)}>
			<ol className="flex items-center space-x-2 sm:space-x-4">
				{steps.map((step, index) => {
					const status = getStepStatus(index)
					const isClickable = clickable && status === 'completed'

					return (
						<li key={step.id} className="flex items-center">
							<button
								type="button"
								onClick={() => isClickable && goToStep(index)}
								disabled={!isClickable}
								className={cn(
									'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
									{
										'bg-primary text-primary-foreground': status === 'current',
										'bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer':
											status === 'completed',
										'bg-muted text-muted-foreground': status === 'upcoming',
										'hover:bg-primary/80 cursor-pointer': isClickable,
										'cursor-default': !isClickable,
									},
								)}
							>
								{status === 'completed' ? (
									<Check className="w-4 h-4" />
								) : (
									<span>{index + 1}</span>
								)}
							</button>

							{/* Step title and description */}
							<div className="ml-2 min-w-0 flex-1 hidden sm:block">
								<div
									className={cn('text-sm font-medium', {
										'text-primary': status === 'current',
										'text-foreground': status === 'completed',
										'text-muted-foreground': status === 'upcoming',
									})}
								>
									{step.title}
								</div>
								{step.description && (
									<div className="text-xs text-muted-foreground">
										{step.description}
									</div>
								)}
							</div>

							{/* Connector line */}
							{index < steps.length - 1 && (
								<div
									className={cn('w-8 h-px ml-2 transition-colors', {
										'bg-primary': index < currentStep,
										'bg-muted': index >= currentStep,
									})}
								/>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
