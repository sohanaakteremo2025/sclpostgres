import * as React from 'react'
import { Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LoadingButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean
	variant?:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link'
	size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function LoadingButton({
	children,
	className,
	disabled,
	isLoading = false,
	variant = 'default',
	size = 'default',
	...props
}: LoadingButton) {
	return (
		<Button
			disabled={disabled || isLoading}
			variant={variant}
			size={size}
			className={cn(className)}
			{...props}
		>
			{isLoading && (
				<Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
			)}
			{children || 'Save'}
		</Button>
	)
}
