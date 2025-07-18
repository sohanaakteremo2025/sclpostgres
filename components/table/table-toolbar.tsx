'use client'

import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableFilter } from './filter'
import { CalendarDatePicker } from './date-picker-calendar'
import { useState } from 'react'
import { DataTableViewOptions } from './view-options'
import ExportTable from './export-table'
import { RefreshCcw, SearchIcon } from 'lucide-react'
import { useMemo } from 'react'

interface DataTableToolbarProps<TData> {
	table: Table<TData>
	filter: (keyof TData)[]
	searchKey: keyof TData
}

export function DataTableToolbar<TData>({
	table,
	filter,
	searchKey = table.getAllColumns()[0].id as keyof TData,
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0

	const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
		from: new Date(new Date().getFullYear(), 0, 1),
		to: new Date(),
	})

	// Function to find the title of the column with date type
	const dateColumn = () => {
		const firstRow = table.getRowModel().rows[0]
		return (
			filter
				.find(columnId => {
					const value = firstRow?.getValue(String(columnId))
					return (
						value instanceof Date ||
						(typeof value === 'string' && !isNaN(Date.parse(value)))
					)
				})
				?.toString() ?? null
		)
	}

	const memoizedDateColumn = useMemo(() => dateColumn(), [table, filter])

	const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
		setDateRange({ from, to })
		table.getColumn(memoizedDateColumn as string)?.setFilterValue([from, to])
	}

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		table.getColumn(searchKey as string)?.setFilterValue(event.target.value)
	}

	return (
		<div className="flex flex-wrap items-center justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<div className="relative">
					<Input
						placeholder={`Search ${searchKey as string}...`}
						value={
							(table
								.getColumn(searchKey as string)
								?.getFilterValue() as string) ?? ''
						}
						onChange={handleSearch}
						className="h-8 w-[150px] lg:w-[250px] pl-8"
					/>
					<span className="absolute left-2 top-1/2 transform -translate-y-1/2">
						<SearchIcon className="h-4 w-4 text-gray-500" />
					</span>
				</div>

				{filter.map((columnTitle, index) => {
					if (columnTitle === memoizedDateColumn) return null
					return (
						<TableFilter
							key={index}
							columnTitle={columnTitle as string}
							table={table}
						/>
					)
				})}

				{memoizedDateColumn && (
					<CalendarDatePicker
						date={dateRange}
						numberOfMonths={2}
						onDateSelect={handleDateSelect}
						// className="w-[250px] h-8"
						variant="outline"
					/>
				)}

				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset <RefreshCcw className="h-4 w-4 ml-2" />
					</Button>
				)}
			</div>
			<div className="flex items-center gap-2 mt-2 md:mt-0">
				<ExportTable table={table} />
				<DataTableViewOptions table={table} />
			</div>
		</div>
	)
}
