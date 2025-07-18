// components/data-table/model-table.tsx
'use client'
import type { DataTableRowAction } from '@/types/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'
import { DataTableFilterMenu } from '@/components/data-table/data-table-filter-menu'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import type { QueryResult } from '@/lib/prisma-query'

interface ModelTableProps<TData> {
	dataPromise: Promise<QueryResult<TData>>
	columns: ColumnDef<TData>[]
	enableAdvancedFilter?: boolean
	filterFlag?: string
	updateDialog?: React.ComponentType<{
		open: boolean
		onOpenChange: (open: boolean) => void
		item: TData | null
	}>
	deleteDialog?: React.ComponentType<{
		open: boolean
		onOpenChange: (open: boolean) => void
		items: TData[]
		onSuccess?: () => void
	}>
}

export function ModelTable<TData>({
	dataPromise,
	columns,
	enableAdvancedFilter = false,
	filterFlag = 'simple',
	updateDialog: UpdateDialog,
	deleteDialog: DeleteDialog,
}: ModelTableProps<TData>) {
	const { data, pageCount } = React.use(dataPromise)

	const [rowAction, setRowAction] =
		React.useState<DataTableRowAction<TData> | null>(null)

	const { table, shallow, debounceMs, throttleMs } = useDataTable({
		data,
		columns,
		pageCount,
		enableAdvancedFilter,
		initialState: {
			sorting: [{ id: 'createdAt', desc: true }],
			columnPinning: { right: ['actions'] },
		},
		getRowId: (originalRow: any) => originalRow.id,
		shallow: false,
		clearOnDefault: true,
	})

	return (
		<>
			<DataTable table={table}>
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

			{/* Update Dialog */}
			{UpdateDialog && rowAction?.variant === 'update' && (
				<UpdateDialog
					open={true}
					onOpenChange={() => setRowAction(null)}
					item={rowAction.row.original}
				/>
			)}

			{/* Delete Dialog */}
			{DeleteDialog && rowAction?.variant === 'delete' && (
				<DeleteDialog
					open={true}
					onOpenChange={() => setRowAction(null)}
					items={[rowAction.row.original]}
					onSuccess={() => rowAction?.row.toggleSelected(false)}
				/>
			)}
		</>
	)
}
