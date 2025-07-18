'use client'

import { ReactNode } from 'react'
import { FieldValues } from 'react-hook-form'
import { useFormContext } from '../contexts/form-context'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface FormSubmitProps<T extends FieldValues = FieldValues> {
	children?: ReactNode
	loadingText?: string
	disabled?: boolean
	variant?:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link'
	size?: 'default' | 'sm' | 'lg' | 'icon'
	className?: string
}

export function FormSubmit<T extends FieldValues = FieldValues>({
	children = 'Submit',
	loadingText = 'Submitting...',
	disabled,
	variant = 'default',
	size = 'default',
	className,
}: FormSubmitProps<T>) {
	const { form, isSubmitting } = useFormContext<T>()

	const isDisabled = disabled || isSubmitting || !form.formState.isValid

	return (
		<Button
			type="submit"
			variant={variant}
			size={size}
			disabled={isDisabled}
			className={className}
		>
			{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			{isSubmitting ? loadingText : children}
		</Button>
	)
}
