// components/ui/data-table.tsx
'use client'

import * as React from 'react'
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from './pagination'
import { ServerPagination } from './server-pagination'
import { DataTableToolbar } from './table-toolbar'
import { currencySimbols } from '@/constants/constants'
import { TrendingDown, TrendingUp, Landmark } from 'lucide-react'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	filter?: (keyof TData)[]
	searchKey?: keyof TData
	isLoading?: boolean
	totalsByType?: { field: keyof TData; typeKey: keyof TData }[]
	displaySummary?: boolean
	// Server-side pagination props
	serverPagination?: {
		pageCount: number
		currentPage: number
		onPageChange: (page: number) => void
		pageSize?: number
		onPageSizeChange?: (pageSize: number) => void
	}
}

export function DataTable<TData, TValue>({
	columns,
	data = [],
	filter = [],
	searchKey,
	isLoading,
	totalsByType,
	displaySummary = false,
	serverPagination,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState({})
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	)
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [pagination, setPagination] = React.useState({
		pageIndex: serverPagination ? serverPagination.currentPage - 1 : 0,
		pageSize: serverPagination?.pageSize || 10,
	})

	// Use server-side pagination info if provided
	React.useEffect(() => {
		if (serverPagination) {
			setPagination({
				pageIndex: serverPagination.currentPage - 1,
				pageSize: serverPagination.pageSize || 10,
			})
		}
	}, [serverPagination])

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		pageCount: serverPagination ? serverPagination.pageCount : undefined,
		enableRowSelection: true,
		manualPagination: !!serverPagination, // Enable manual pagination if server pagination is provided
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: updater => {
			const newPagination =
				typeof updater === 'function' ? updater(pagination) : updater

			setPagination(newPagination)

			// Call server-side callback if provided
			if (serverPagination) {
				const { pageIndex, pageSize } = newPagination

				// Page change
				if (pageIndex !== pagination.pageIndex) {
					serverPagination.onPageChange(pageIndex + 1)
				}

				// Page size change
				if (
					pageSize !== pagination.pageSize &&
					serverPagination.onPageSizeChange
				) {
					serverPagination.onPageSizeChange(pageSize)
				}
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	})

	// Calculate grouped totals by type (if needed)
	const calculateTotalsByType = (
		rows: TData[],
		field: keyof TData,
		typeKey: keyof TData,
	) => {
		return rows.reduce<Record<string, number>>((totals, row) => {
			const type = row[typeKey] as string // e.g., 'income' or 'expense' or deposit
			const amount = Number(row[field]) || 0

			if (type) {
				totals[type] = (totals[type] || 0) + amount
			}
			return totals
		}, {})
	}

	// Calculate current page totals
	const currentPageTotals =
		totalsByType?.map(({ field, typeKey }) =>
			calculateTotalsByType(
				table.getPaginationRowModel().rows.map(row => row.original),
				field,
				typeKey,
			),
		) || []

	// Calculate all data totals (includes all data regardless of filtering or sorting)
	const allDataTotals =
		totalsByType?.map(({ field, typeKey }) =>
			calculateTotalsByType(
				data, // Use the original data array instead of filtered data
				field,
				typeKey,
			),
		) || []

	// Calculate the combined metrics
	const calculateSummaryMetrics = (totals: Record<string, number>) => {
		const income = totals['income'] || 0
		const expense = totals['expense'] || 0
		const deposit = totals['deposit'] || 0
		const withdrawal = totals['withdrawal'] || 0

		// Net income calculation (income - expense)
		const netIncome = income - expense

		// Bank amount calculation (deposits - withdrawals)
		const bankAmount = deposit - withdrawal

		return {
			income,
			expense,
			netIncome,
			bankAmount,
		}
	}

	// Get summary metrics for current page and all data
	const currentPageMetrics =
		currentPageTotals.length > 0
			? calculateSummaryMetrics(currentPageTotals[0])
			: { income: 0, expense: 0, netIncome: 0, bankAmount: 0 }

	const allDataMetrics =
		allDataTotals.length > 0
			? calculateSummaryMetrics(allDataTotals[0])
			: { income: 0, expense: 0, netIncome: 0, bankAmount: 0 }

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								{columns.map((column, index) => (
									<TableHead key={index}>
										<Skeleton className="h-6 w-full" />
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, rowIndex) => (
								<TableRow key={rowIndex}>
									{columns.map((column, cellIndex) => (
										<TableCell key={cellIndex}>
											<Skeleton className="h-6 w-full" />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				<Skeleton className="h-10 w-full" />
			</div>
		)
	}

	return (
		<div className="space-y-4 w-full flex flex-col">
			{/* Summary cards for all records */}
			{displaySummary && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Income card */}
					<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Total Income
								</p>
								<h3 className="text-xl font-semibold text-green-500">
									{currencySimbols['BDT']}
									{allDataMetrics.income.toFixed(2)}
								</h3>
							</div>
							<TrendingUp size={24} className="text-green-500" />
						</div>
					</div>

					{/* Expense card */}
					<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Total Expense
								</p>
								<h3 className="text-xl font-semibold text-red-500">
									{currencySimbols['BDT']}
									{allDataMetrics.expense.toFixed(2)}
								</h3>
							</div>
							<TrendingDown size={24} className="text-red-500" />
						</div>
					</div>

					{/* Bank Balance card */}
					<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Bank Balance
								</p>
								<h3 className="text-xl font-semibold text-blue-500">
									{currencySimbols['BDT']}
									{allDataMetrics.bankAmount.toFixed(2)}
								</h3>
							</div>
							<Landmark size={24} className="text-blue-500" />
						</div>
					</div>

					{/* Net Income card */}
					<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Net Income
								</p>
								<h3
									className={`text-xl font-semibold ${
										allDataMetrics.netIncome >= 0
											? 'text-green-500'
											: 'text-red-500'
									}`}
								>
									{currencySimbols['BDT']}
									{allDataMetrics.netIncome.toFixed(2)}
								</h3>
							</div>
							{allDataMetrics.netIncome >= 0 ? (
								<TrendingUp size={24} className="text-green-500" />
							) : (
								<TrendingDown size={24} className="text-red-500" />
							)}
						</div>
					</div>
				</div>
			)}

			{/* Current page totals */}
			{displaySummary && (
				<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700">
					<h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
						Current Page Totals:
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex items-center gap-2">
							<TrendingUp size={18} className="text-green-500" />
							<span className="text-gray-600 dark:text-gray-400">Income:</span>
							<span className="text-green-500 font-medium">
								{currencySimbols['BDT']}
								{currentPageMetrics.income.toFixed(2)}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<TrendingDown size={18} className="text-red-500" />
							<span className="text-gray-600 dark:text-gray-400">Expense:</span>
							<span className="text-red-500 font-medium">
								{currencySimbols['BDT']}
								{currentPageMetrics.expense.toFixed(2)}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Landmark size={18} className="text-blue-500" />
							<span className="text-gray-600 dark:text-gray-400">
								Bank Transactions:
							</span>
							<span
								className={`font-medium ${
									currentPageMetrics.bankAmount >= 0
										? 'text-blue-500'
										: 'text-red-500'
								}`}
							>
								{currencySimbols['BDT']}
								{currentPageMetrics.bankAmount.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Toolbar for search and filtering */}
			{searchKey && filter && filter.length > 0 && (
				<DataTableToolbar searchKey={searchKey} table={table} filter={filter} />
			)}

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
												  )}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Conditionally render either server-side or client-side pagination */}
			{serverPagination ? (
				<ServerPagination
					currentPage={serverPagination.currentPage}
					pageCount={serverPagination.pageCount}
					onPageChange={serverPagination.onPageChange}
					pageSize={serverPagination.pageSize || 10}
					onPageSizeChange={serverPagination.onPageSizeChange}
				/>
			) : (
				<DataTablePagination table={table} />
			)}
		</div>
	)
}
