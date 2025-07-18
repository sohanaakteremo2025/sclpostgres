'use client'

import { ReactNode, FormHTMLAttributes } from 'react'
import { FieldValues } from 'react-hook-form'
import { useFormContext } from '../contexts/form-context'
import { cn } from '@/lib/utils'

interface FormRootProps<T extends FieldValues = FieldValues>
	extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
	children: ReactNode
	className?: string
}

export function FormRoot<T extends FieldValues = FieldValues>({
	children,
	className,
	...props
}: FormRootProps<T>) {
	const { form, onSubmit } = useFormContext<T>()

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
