'use client'

import { ReactNode, FormHTMLAttributes } from 'react'
import { FieldValues } from 'react-hook-form'
import { useMultiStepFormContext } from '../contexts/form-context'
import { cn } from '@/lib/utils'

interface MultiStepFormRootProps<T extends FieldValues = FieldValues>
	extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
	children: ReactNode
	className?: string
}

export function MultiStepFormRoot<T extends FieldValues = FieldValues>({
	children,
	className,
	...props
}: MultiStepFormRootProps<T>) {
	const { form, onSubmit } = useMultiStepFormContext<T>()

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className={cn('space-y-6', className)}
			{...props}
		>
			{children}
		</form>
	)
}
