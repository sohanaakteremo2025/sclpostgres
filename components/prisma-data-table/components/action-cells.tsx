// components/data-table/components/action-cells.tsx
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePrismaDataTable } from '../prisma-data-table'
import { Ellipsis, LucideIcon } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import type { Row } from '@tanstack/react-table'

export function ActionsCell<TData = any>({
	row,
	options,
	actionConfig,
}: {
	row: Row<TData> // Use the full Row type from TanStack
	options: string[] // Now accepts any string actions
	actionConfig?: Record<
		string,
		{
			label?: string
			icon?: LucideIcon
			onClick?: (row: TData) => void
			className?: string
			variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
			disabled?: (row: TData) => boolean
			shortcut?: string
			useSetRowAction?: boolean // Whether to use setRowAction or onClick
		}
	>
}) {
	const { setRowAction } = usePrismaDataTable()

	const handleAction = (actionKey: string) => {
		const config = actionConfig?.[actionKey]

		// If onClick is provided and useSetRowAction is not explicitly true, use onClick
		if (config?.onClick && config.useSetRowAction !== true) {
			config.onClick(row.original)
		} else {
			// Otherwise, use the setRowAction system (for dialogs, etc.)
			setRowAction({ row, variant: actionKey })
		}
	}

	const isActionDisabled = (actionKey: string) => {
		return actionConfig?.[actionKey]?.disabled?.(row.original) ?? false
	}

	const getActionClassName = (actionKey: string) => {
		const config = actionConfig?.[actionKey]
		const variant = config?.variant
		const customClass = config?.className

		let variantClass = 'cursor-pointer'

		switch (variant) {
			case 'destructive':
				variantClass +=
					' text-red-600 hover:bg-red-50 focus:text-red-600 dark:hover:bg-red-900/20'
				break
			case 'secondary':
				variantClass += ' text-muted-foreground hover:bg-secondary'
				break
			case 'outline':
				variantClass += ' border border-input hover:bg-accent'
				break
			case 'ghost':
				variantClass += ' hover:bg-accent hover:text-accent-foreground'
				break
			default:
				variantClass += ' hover:bg-accent hover:text-accent-foreground'
		}

		return cn(variantClass, customClass)
	}

	const getActionLabel = (actionKey: string) => {
		const config = actionConfig?.[actionKey]
		if (config?.label) return config.label

		// Default labels for common actions
		switch (actionKey) {
			case 'view':
				return 'View Details'
			case 'update':
				return 'Edit'
			case 'delete':
				return 'Delete'
			default:
				// Convert camelCase to Title Case
				return actionKey
					.replace(/([A-Z])/g, ' $1')
					.replace(/^./, str => str.toUpperCase())
					.trim()
		}
	}

	const shouldShowSeparator = (index: number) => {
		// Show separator before delete if it exists and there are other actions
		const deleteIndex = options.indexOf('delete')
		return deleteIndex !== -1 && index === deleteIndex && deleteIndex > 0
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Open menu"
					variant="ghost"
					className="flex size-8 p-0 data-[state=open]:bg-muted"
				>
					<Ellipsis className="size-4" aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				{options.map((action, index) => {
					const config = actionConfig?.[action]
					const disabled = isActionDisabled(action)
					const showSeparator = shouldShowSeparator(index)

					return (
						<React.Fragment key={action}>
							{showSeparator && <DropdownMenuSeparator />}
							<DropdownMenuItem
								onSelect={() => !disabled && handleAction(action)}
								disabled={disabled}
								className={cn(
									getActionClassName(action),
									disabled && 'opacity-50 cursor-not-allowed',
								)}
							>
								{config?.icon &&
									React.createElement(config.icon, {
										className: 'mr-2 h-4 w-4',
									})}
								{getActionLabel(action)}
								{config?.shortcut && (
									<DropdownMenuShortcut>{config.shortcut}</DropdownMenuShortcut>
								)}
								{action === 'delete' && !config?.shortcut && (
									<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
								)}
							</DropdownMenuItem>
						</React.Fragment>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

// Alternative version with more granular control over PrismaDataTable integration
export function PrismaActionsCell<TData = any>({
	row,
	actions,
}: {
	row: Row<TData> // Use the full Row type from TanStack
	actions: Array<{
		key: string
		label: string
		icon?: LucideIcon
		onClick?: (row: TData) => void
		variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
		disabled?: (row: TData) => boolean
		shortcut?: string
		useDialog?: boolean // Whether this action should open a dialog via setRowAction
		className?: string
	}>
}) {
	const { setRowAction } = usePrismaDataTable()

	const handleAction = (action: (typeof actions)[0]) => {
		if (action.useDialog) {
			// Use PrismaDataTable's dialog system
			setRowAction({ row, variant: action.key })
		} else if (action.onClick) {
			// Use custom onClick handler
			action.onClick(row.original)
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Open menu"
					variant="ghost"
					className="flex size-8 p-0 data-[state=open]:bg-muted"
				>
					<Ellipsis className="size-4" aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				{actions.map((action, index) => {
					const disabled = action.disabled?.(row.original) ?? false
					const isDestructive = action.variant === 'destructive'
					const showSeparator = isDestructive && index > 0

					return (
						<React.Fragment key={action.key}>
							{showSeparator && <DropdownMenuSeparator />}
							<DropdownMenuItem
								onSelect={() => !disabled && handleAction(action)}
								disabled={disabled}
								className={cn(
									'cursor-pointer',
									isDestructive &&
										'text-red-600 hover:bg-red-50 focus:text-red-600 dark:hover:bg-red-900/20',
									action.className,
									disabled && 'opacity-50 cursor-not-allowed',
								)}
							>
								{action.icon &&
									React.createElement(action.icon, {
										className: 'mr-2 h-4 w-4',
									})}
								{action.label}
								{action.shortcut && (
									<DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
								)}
							</DropdownMenuItem>
						</React.Fragment>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
