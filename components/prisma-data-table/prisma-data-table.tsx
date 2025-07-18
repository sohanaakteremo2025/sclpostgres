// components/data-table/reusable-data-table.tsx
'use client'
import type { DataTableRowAction } from './types/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import * as React from 'react'
import { DataTable } from './components/data-table'
import { DataTableSkeleton } from './components/data-table-skeleton'
import { useDataTable } from './hooks/use-data-table'
import { DataTableAdvancedToolbar } from './components/data-table-advanced-toolbar'
import { DataTableFilterList } from './components/data-table-filter-list'
import { DataTableFilterMenu } from './components/data-table-filter-menu'
import { DataTableSortList } from './components/data-table-sort-list'
import { DataTableToolbar } from './components/data-table-toolbar'
import {
	DataTableActionBar,
	DataTableActionBarAction,
	DataTableActionBarSelection,
} from './components/data-table-action-bar'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import type { QueryResult } from './lib/prisma-query'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

interface PrismaDataTableProps<TData> {
	dataPromise: Promise<QueryResult<TData>>
	columns: ColumnDef<TData>[]
	enableAdvancedFilter?: boolean
	filterFlag?: 'simple' | 'advancedFilters'
	initialSorting?: Array<{ id: string; desc: boolean }>
	pinnedColumns?: {
		left?: string[]
		right?: string[]
	}
	children?: React.ReactNode
}

interface PrismaDataTableContextValue<TData> {
	rowAction: DataTableRowAction<TData> | null
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<TData> | null>
	>
	createOpen: boolean
	setCreateOpen: React.Dispatch<React.SetStateAction<boolean>>
	onClose: () => void
	onSuccess: () => void
	onCreateClose: () => void
	// Add these new properties for action bar
	table: any // The TanStack table instance
	actionBarOpen: boolean
	setActionBarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const PrismaDataTableContext =
	React.createContext<PrismaDataTableContextValue<any> | null>(null)

function PrismaDataTableInner<TData>({
	dataPromise,
	columns,
	enableAdvancedFilter = false,
	filterFlag = 'simple',
	initialSorting = [{ id: 'createdAt', desc: true }],
	pinnedColumns = { right: ['actions'] },
	children,
}: PrismaDataTableProps<TData>) {
	const { data, pageCount } = React.use(dataPromise)

	const [rowAction, setRowAction] =
		React.useState<DataTableRowAction<TData> | null>(null)
	const [createOpen, setCreateOpen] = React.useState(false)
	const [actionBarOpen, setActionBarOpen] = React.useState(false)

	const { table, shallow, debounceMs, throttleMs } = useDataTable({
		data,
		columns,
		pageCount,
		enableAdvancedFilter,
		initialState: {
			sorting: initialSorting,
			columnPinning: pinnedColumns,
		},
		getRowId: (originalRow: any) => originalRow.id,
		shallow: false,
		clearOnDefault: true,
	})

	const contextValue = React.useMemo(
		() => ({
			rowAction,
			setRowAction,
			createOpen,
			setCreateOpen,
			actionBarOpen,
			setActionBarOpen,
			table, // Add table to context
			onClose: () => setRowAction(null),
			onSuccess: () => rowAction?.row.toggleSelected(false),
			onCreateClose: () => setCreateOpen(false),
		}),
		[rowAction, createOpen, actionBarOpen, table],
	)

	// Find ActionBarAction components from children
	const actionBarActions = React.Children.toArray(children).filter(
		(child: any) => child?.type?.displayName === 'ActionBarAction',
	)

	// Create the action bar component if ActionBarAction children exist
	const actionBarComponent =
		actionBarActions.length > 0 ? (
			<DataTableActionBar table={table}>
				<DataTableActionBarSelection table={table} />
				{(() => {
					const selectedRows = table
						.getFilteredSelectedRowModel()
						.rows.map((row: any) => row.original)
					const selectedCount = selectedRows.length

					if (selectedCount === 0) return null

					// Clone each ActionBarAction with enhanced props
					return actionBarActions.map((action: any, index) =>
						React.cloneElement(action, {
							key: index,
							selectedRows,
							selectedCount,
							table,
						}),
					)
				})()}
			</DataTableActionBar>
		) : null

	// Filter out action bar actions from other children
	const otherChildren = React.Children.toArray(children).filter(
		(child: any) => child?.type?.displayName !== 'ActionBarAction',
	)

	return (
		<PrismaDataTableContext.Provider value={contextValue}>
			<div>
				<DataTable table={table} actionBar={actionBarComponent}>
					{enableAdvancedFilter ? (
						<DataTableAdvancedToolbar table={table}>
							<DataTableSortList table={table} align="start" />
							{filterFlag === 'advancedFilters' ? (
								<DataTableFilterList
									table={table}
									shallow={shallow}
									debounceMs={debounceMs}
									throttleMs={throttleMs}
									align="start"
								/>
							) : (
								<DataTableFilterMenu
									table={table}
									shallow={shallow}
									debounceMs={debounceMs}
									throttleMs={throttleMs}
								/>
							)}
						</DataTableAdvancedToolbar>
					) : (
						<DataTableToolbar table={table}>
							<DataTableSortList table={table} align="end" />
						</DataTableToolbar>
					)}
				</DataTable>

				{/* Render other children (dialogs) - exclude action bar actions */}
				{otherChildren}
			</div>
		</PrismaDataTableContext.Provider>
	)
}

// Main wrapper component with Suspense and skeleton
export function PrismaDataTable<TData>({
	dataPromise,
	columns,
	enableAdvancedFilter = false,
	filterFlag = 'simple',
	initialSorting = [{ id: 'createdAt', desc: true }],
	pinnedColumns = { right: ['actions'] },
	children,
	// Skeleton configuration
	skeletonConfig,
}: PrismaDataTableProps<TData> & {
	skeletonConfig?: {
		columnCount?: number
		filterCount?: number
		cellWidths?: string[]
		shrinkZero?: boolean
	}
}) {
	// Auto-calculate skeleton config if not provided
	const defaultSkeletonConfig = React.useMemo(() => {
		const columnCount = columns.length
		const filterCount = Math.min(
			columns.filter(col => col.enableColumnFilter).length,
			enableAdvancedFilter ? 4 : 2,
		)

		// Generate reasonable cell widths based on column count
		const cellWidths = columns.map((col, index) => {
			if (col.id === 'select') return '3rem'
			if (col.id === 'actions') return '4rem'
			if (col.size) return `${col.size}px`

			// Default widths based on common patterns
			if (index === 1) return '12rem' // Usually name/title
			if (index === columnCount - 2) return '8rem' // Usually date
			return '10rem' // Default width
		})

		return {
			columnCount,
			filterCount,
			cellWidths,
			shrinkZero: true,
		}
	}, [columns, enableAdvancedFilter])

	const finalSkeletonConfig = { ...defaultSkeletonConfig, ...skeletonConfig }

	return (
		<React.Suspense fallback={<DataTableSkeleton {...finalSkeletonConfig} />}>
			<PrismaDataTableInner
				dataPromise={dataPromise}
				columns={columns}
				enableAdvancedFilter={enableAdvancedFilter}
				filterFlag={filterFlag}
				initialSorting={initialSorting}
				pinnedColumns={pinnedColumns}
			>
				{children}
			</PrismaDataTableInner>
		</React.Suspense>
	)
}

// Hook to access the context with better type safety
export function usePrismaDataTable<
	TData = any,
>(): PrismaDataTableContextValue<TData> {
	const context = React.useContext(PrismaDataTableContext)
	if (!context) {
		throw new Error('usePrismaDataTable must be used within PrismaDataTable')
	}
	return context as PrismaDataTableContextValue<TData>
}

// Compound components for dialogs
export function UpdateDialog<TData>({
	title = 'Update Item',
	children,
}: {
	title?: string
	children: (props: {
		item: TData | null
		onSuccess: () => void
	}) => React.ReactNode
}) {
	const { rowAction, onClose } = usePrismaDataTable<TData>()

	if (rowAction?.variant !== 'update') return null

	const handleSuccess = () => {
		onClose()
		// Item will be deselected automatically via onSuccess in context
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="w-full lg:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="max-h-[85vh] overflow-y-auto pr-5">
					{children({
						item: rowAction.row.original as TData,
						onSuccess: handleSuccess,
					})}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export function DeleteDialog<TData>({
	title = 'Delete Item',
	getDescription,
	onDelete,
	destructiveText = 'Delete',
	cancelText = 'Cancel',
}: {
	title?: string
	getDescription: (item: TData) => string
	onDelete: (item: TData) => Promise<void>
	destructiveText?: string
	cancelText?: string
}) {
	const { rowAction, onClose, onSuccess } = usePrismaDataTable<TData>()
	const [isLoading, setIsLoading] = React.useState(false)

	if (rowAction?.variant !== 'delete') return null

	const handleDelete = async () => {
		setIsLoading(true)
		try {
			await onDelete(rowAction.row.original as TData)
			onSuccess() // This will deselect the row
			onClose()
		} catch (error) {
			console.error('Delete failed:', error)
			// You could add toast notification here
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
							<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<DialogTitle className="text-lg font-semibold">
								{title}
							</DialogTitle>
						</div>
					</div>
					<DialogDescription className="text-sm text-muted-foreground mt-2">
						{getDescription(rowAction.row.original as TData)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-2">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						{cancelText}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isLoading}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{destructiveText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export function CustomDialog<TData>({
	variant,
	title = 'Custom Action',
	className,
	children,
}: {
	variant: string
	title?: string
	className?: string
	children: (props: {
		item: TData | null
		onSuccess: () => void
	}) => React.ReactNode
}) {
	const { rowAction, onClose } = usePrismaDataTable<TData>()

	if (rowAction?.variant !== variant) return null

	const handleSuccess = () => {
		onClose()
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className={cn('w-full lg:max-w-4xl', className)}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="max-h-[85vh] overflow-y-auto pr-5 pl-2">
					{children({
						item: rowAction.row.original as TData,
						onSuccess: handleSuccess,
					})}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export function CreateDialog<TData>({
	trigger,
	title = 'Create New Item',
	children,
	className = 'absolute md:top-6 md:right-6 top-2 right-2',
}: {
	trigger?: React.ReactNode
	title?: string
	children: (props: { onSuccess: () => void }) => React.ReactNode
	className?: string
}) {
	const { createOpen, setCreateOpen, onCreateClose } =
		usePrismaDataTable<TData>()

	const handleSuccess = () => {
		onCreateClose()
		// You might want to trigger a data refresh here
		// This could be handled by the parent component
	}

	return (
		<>
			{/* Trigger Button */}
			{trigger && (
				<div className={className}>
					<div onClick={() => setCreateOpen(true)}>{trigger}</div>
				</div>
			)}

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent className="w-full lg:max-w-4xl">
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<div className="max-h-[85vh] overflow-y-auto pr-3 pl-2">
						{children({ onSuccess: handleSuccess })}
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

// MODIFIED: ActionBarAction compound component - now works without ActionBar wrapper
export function ActionBarAction({
	children,
	onAction,
	tooltip,
	isPending,
	variant = 'secondary',
	selectedRows, // These will be injected by the parent
	selectedCount,
	table,
	...props
}: {
	children:
		| React.ReactNode
		| ((props: {
				selectedRows: any[]
				selectedCount: number
				table: any
		  }) => React.ReactNode)
	onAction?: (props: {
		selectedRows: any[]
		selectedCount: number
		table: any
	}) => void | Promise<void>
	tooltip?: string
	isPending?: boolean
	variant?: 'secondary' | 'destructive' | 'outline'
	selectedRows?: any[] // Injected by parent
	selectedCount?: number // Injected by parent
	table?: any // Injected by parent
} & Omit<
	React.ComponentProps<typeof DataTableActionBarAction>,
	'children' | 'onClick'
>) {
	const [loading, setLoading] = React.useState(false)

	const handleClick = async () => {
		if (!onAction || !selectedRows || !table) return

		setLoading(true)
		try {
			await onAction({ selectedRows, selectedCount: selectedCount || 0, table })
		} catch (error) {
			console.error('Action failed:', error)
		} finally {
			setLoading(false)
		}
	}

	// Render children with context if it's a function
	const renderedChildren =
		typeof children === 'function'
			? children({
					selectedRows: selectedRows || [],
					selectedCount: selectedCount || 0,
					table,
				})
			: children

	return (
		<DataTableActionBarAction
			tooltip={tooltip}
			isPending={isPending || loading}
			onClick={handleClick}
			variant={variant}
			{...props}
		>
			{renderedChildren}
		</DataTableActionBarAction>
	)
}

// Set display name for filtering
ActionBarAction.displayName = 'ActionBarAction'

// REMOVED: ActionBar component is no longer needed

// Bulk action dialog component
export function BulkActionDialog<TData>({
	variant,
	title = 'Bulk Action',
	children,
}: {
	variant: string
	title?: string
	children: (props: {
		selectedRows: TData[]
		selectedCount: number
		onSuccess: () => void
		onClose: () => void
	}) => React.ReactNode
}) {
	const { table, rowAction, onClose } = usePrismaDataTable<TData>()

	if (rowAction?.variant !== variant) return null

	const selectedRows = table
		.getFilteredSelectedRowModel()
		.rows.map((row: any) => row.original)

	const handleSuccess = () => {
		// Clear selection and close dialog
		table.toggleAllRowsSelected(false)
		onClose()
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="w-full lg:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="max-h-[85vh] overflow-y-auto pr-5 pl-2">
					{children({
						selectedRows,
						selectedCount: selectedRows.length,
						onSuccess: handleSuccess,
						onClose,
					})}
				</div>
			</DialogContent>
		</Dialog>
	)
}

// Export compound component
PrismaDataTable.UpdateDialog = UpdateDialog
PrismaDataTable.DeleteDialog = DeleteDialog
PrismaDataTable.CustomDialog = CustomDialog
PrismaDataTable.CreateDialog = CreateDialog
PrismaDataTable.ActionBarAction = ActionBarAction
PrismaDataTable.BulkActionDialog = BulkActionDialog
