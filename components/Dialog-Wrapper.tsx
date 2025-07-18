import React from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface DialogWrapperProps {
	children:
		| React.ReactNode
		| ((props: { onSuccess: () => void }) => React.ReactNode)
	title: string
	description?: string

	// Trigger options
	triggerLabel?: string
	triggerVariant?:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link'
	triggerIcon?: LucideIcon
	customTrigger?: React.ReactNode

	// Dialog options
	size?: 'sm' | 'md' | 'lg' | 'xl'
	className?: string

	// Control from parent
	open?: boolean
	onOpenChange?: (open: boolean) => void
	onSuccess?: () => void
}

const sizeClasses = {
	sm: 'max-w-md',
	md: 'max-w-lg',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
}

export default function DialogWrapper({
	children,
	title,
	description,
	triggerLabel,
	triggerVariant = 'default',
	triggerIcon: TriggerIcon,
	customTrigger,
	size = 'md',
	className,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	onSuccess: onSuccessProp,
}: DialogWrapperProps) {
	const [internalOpen, setInternalOpen] = React.useState(false)

	// Use controlled or uncontrolled state
	const isControlled = controlledOpen !== undefined
	const open = isControlled ? controlledOpen : internalOpen
	const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen

	const handleOpenChange = (newOpen: boolean) => {
		setOpen?.(newOpen)
	}

	const handleSuccess = () => {
		setOpen?.(false)
		onSuccessProp?.()
	}

	const renderTrigger = () => {
		if (customTrigger) {
			return customTrigger
		}

		return (
			<Button variant={triggerVariant}>
				{TriggerIcon && <TriggerIcon className="w-4 h-4 mr-2" />}
				{triggerLabel || title}
			</Button>
		)
	}

	const renderChildren = () => {
		if (typeof children === 'function') {
			return children({ onSuccess: handleSuccess })
		}
		return children
	}

	// If controlled without trigger, render just the dialog
	if (isControlled && !customTrigger && !triggerLabel) {
		return (
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className={cn(sizeClasses[size], className)}>
					{title && (
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
							{description && (
								<DialogDescription>{description}</DialogDescription>
							)}
						</DialogHeader>
					)}
					{renderChildren()}
				</DialogContent>
			</Dialog>
		)
	}

	// Standard dialog with trigger
	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
			<DialogContent className={cn(sizeClasses[size], className)}>
				{title && (
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						{description && (
							<DialogDescription>{description}</DialogDescription>
						)}
					</DialogHeader>
				)}
				{renderChildren()}
			</DialogContent>
		</Dialog>
	)
}

// Convenience hook for dialog state management
export function useDialog(defaultOpen = false) {
	const [open, setOpen] = React.useState(defaultOpen)

	const openDialog = () => setOpen(true)
	const closeDialog = () => setOpen(false)
	const toggleDialog = () => setOpen(prev => !prev)

	return {
		open,
		setOpen,
		openDialog,
		closeDialog,
		toggleDialog,
	}
}
