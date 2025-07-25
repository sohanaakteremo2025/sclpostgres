'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Table } from '@tanstack/react-table'
import { Loader } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Cross2Icon } from '@radix-ui/react-icons'

interface DataTableActionBarProps<TData>
	extends React.ComponentProps<typeof motion.div> {
	table: Table<TData>
	visible?: boolean
	container?: Element | DocumentFragment | null
}

function DataTableActionBar<TData>({
	table,
	visible: visibleProp,
	container: containerProp,
	children,
	className,
	...props
}: DataTableActionBarProps<TData>) {
	const [mounted, setMounted] = React.useState(false)

	React.useLayoutEffect(() => {
		setMounted(true)
	}, [])

	React.useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				table.toggleAllRowsSelected(false)
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [table])

	const container =
		containerProp ?? (mounted ? globalThis.document?.body : null)

	if (!container) return null

	const visible =
		visibleProp ?? table.getFilteredSelectedRowModel().rows.length > 0

	return ReactDOM.createPortal(
		<AnimatePresence>
			{visible && (
				<motion.div
					role="toolbar"
					aria-orientation="horizontal"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.2, ease: 'easeInOut' }}
					className={cn(
						'fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white p-2 text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50',
						className,
					)}
					{...props}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>,
		container,
	)
}

interface DataTableActionBarActionProps
	extends React.ComponentProps<typeof Button> {
	tooltip?: string
	isPending?: boolean
}

function DataTableActionBarAction({
	size = 'sm',
	tooltip,
	isPending,
	disabled,
	className,
	children,
	...props
}: DataTableActionBarActionProps) {
	const trigger = (
		<Button
			variant="secondary"
			size={size}
			className={cn(
				'gap-1.5 border border-neutral-200 border-neutral-100 bg-neutral-100/50 hover:bg-neutral-100/70 [&>svg]:size-3.5 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/70',
				size === 'icon' ? 'size-7' : 'h-7',
				className,
			)}
			disabled={disabled || isPending}
			{...props}
		>
			{isPending ? <Loader className="animate-spin" /> : children}
		</Button>
	)

	if (!tooltip) return trigger

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{trigger}</TooltipTrigger>
				<TooltipContent
					sideOffset={6}
					className="border bg-neutral-100 font-semibold text-neutral-950 dark:bg-zinc-900 [&>span]:hidden dark:bg-neutral-800 dark:text-neutral-50"
				>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

interface DataTableActionBarSelectionProps<TData> {
	table: Table<TData>
}

function DataTableActionBarSelection<TData>({
	table,
}: DataTableActionBarSelectionProps<TData>) {
	const onClearSelection = React.useCallback(() => {
		table.toggleAllRowsSelected(false)
	}, [table])

	return (
		<div className="flex h-7 items-center rounded-md border border-neutral-200 pr-1 pl-2.5 dark:border-neutral-800">
			<span className="whitespace-nowrap text-xs">
				{table.getFilteredSelectedRowModel().rows.length} selected
			</span>
			<Separator
				orientation="vertical"
				className="mr-1 ml-2 data-[orientation=vertical]:h-4"
			/>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="size-5"
							onClick={onClearSelection}
						>
							<Cross2Icon className="size-3.5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent
						sideOffset={10}
						className="flex items-center gap-2 border border-neutral-200 bg-neutral-100 px-2 py-1 font-semibold text-neutral-950 dark:bg-zinc-900 [&>span]:hidden dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-50"
					>
						<p>Clear selection</p>
						<kbd className="select-none rounded border border-neutral-200 bg-white px-1.5 py-px font-mono font-normal text-[0.7rem] text-neutral-950 shadow-xs dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50">
							<abbr title="Escape" className="no-underline">
								Esc
							</abbr>
						</kbd>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	)
}

export {
	DataTableActionBar,
	DataTableActionBarAction,
	DataTableActionBarSelection,
}
