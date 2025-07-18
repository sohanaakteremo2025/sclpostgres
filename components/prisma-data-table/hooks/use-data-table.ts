// hooks/use-data-table.ts
'use client'

import {
	type ColumnFiltersState,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type TableOptions,
	type TableState,
	type Updater,
	type VisibilityState,
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import {
	type UseQueryStateOptions,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from 'nuqs'
import * as React from 'react'
import { useDebouncedCallback } from './use-debounced-callback'

const PAGE_KEY = 'page'
const PER_PAGE_KEY = 'perPage'
const SORT_KEY = 'sort'
const FILTERS_KEY = 'filters'
const DEBOUNCE_MS = 300
const THROTTLE_MS = 50

interface UseDataTableProps<TData>
	extends Omit<
			TableOptions<TData>,
			| 'state'
			| 'pageCount'
			| 'getCoreRowModel'
			| 'manualFiltering'
			| 'manualPagination'
			| 'manualSorting'
		>,
		Required<Pick<TableOptions<TData>, 'pageCount'>> {
	initialState?: Partial<TableState>
	history?: 'push' | 'replace'
	debounceMs?: number
	throttleMs?: number
	clearOnDefault?: boolean
	enableAdvancedFilter?: boolean
	scroll?: boolean
	shallow?: boolean
	startTransition?: React.TransitionStartFunction
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
	const {
		columns,
		pageCount = -1,
		initialState,
		history = 'replace',
		debounceMs = DEBOUNCE_MS,
		throttleMs = THROTTLE_MS,
		clearOnDefault = false,
		enableAdvancedFilter = false,
		scroll = false,
		shallow = true,
		startTransition,
		...tableProps
	} = props

	const queryStateOptions = React.useMemo<
		Omit<UseQueryStateOptions<string>, 'parse'>
	>(
		() => ({
			history,
			scroll,
			shallow,
			throttleMs,
			debounceMs,
			clearOnDefault,
			startTransition,
		}),
		[
			history,
			scroll,
			shallow,
			throttleMs,
			debounceMs,
			clearOnDefault,
			startTransition,
		],
	)

	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
		initialState?.rowSelection ?? {},
	)
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>(initialState?.columnVisibility ?? {})

	const [page, setPage] = useQueryState(
		PAGE_KEY,
		parseAsInteger.withOptions(queryStateOptions).withDefault(1),
	)
	const [perPage, setPerPage] = useQueryState(
		PER_PAGE_KEY,
		parseAsInteger
			.withOptions(queryStateOptions)
			.withDefault(initialState?.pagination?.pageSize ?? 10),
	)

	const pagination: PaginationState = React.useMemo(() => {
		return {
			pageIndex: page - 1, // zero-based index -> one-based index
			pageSize: perPage,
		}
	}, [page, perPage])

	const onPaginationChange = React.useCallback(
		(updaterOrValue: Updater<PaginationState>) => {
			if (typeof updaterOrValue === 'function') {
				const newPagination = updaterOrValue(pagination)
				void setPage(newPagination.pageIndex + 1)
				void setPerPage(newPagination.pageSize)
			} else {
				void setPage(updaterOrValue.pageIndex + 1)
				void setPerPage(updaterOrValue.pageSize)
			}
		},
		[pagination, setPage, setPerPage],
	)

	// Simplified sorting - just store as string and parse when needed
	const [sorting, setSorting] = useQueryState(
		SORT_KEY,
		parseAsString.withOptions(queryStateOptions).withDefault(''),
	)

	const parsedSorting = React.useMemo(() => {
		if (!sorting) return initialState?.sorting ?? []
		try {
			return JSON.parse(sorting)
		} catch {
			return []
		}
	}, [sorting, initialState?.sorting])

	const onSortingChange = React.useCallback(
		(updaterOrValue: Updater<SortingState>) => {
			let newSorting: SortingState
			if (typeof updaterOrValue === 'function') {
				newSorting = updaterOrValue(parsedSorting)
			} else {
				newSorting = updaterOrValue
			}
			setSorting(JSON.stringify(newSorting))
		},
		[parsedSorting, setSorting],
	)

	// Simplified filters - store as string
	const [filters, setFilters] = useQueryState(
		FILTERS_KEY,
		parseAsString.withOptions(queryStateOptions).withDefault(''),
	)

	const parsedFilters = React.useMemo(() => {
		if (!filters) return []
		try {
			return JSON.parse(filters)
		} catch {
			return []
		}
	}, [filters])

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	)

	const debouncedSetFilters = useDebouncedCallback((newFilters: any[]) => {
		void setPage(1)
		void setFilters(JSON.stringify(newFilters))
	}, debounceMs)

	const onColumnFiltersChange = React.useCallback(
		(updaterOrValue: Updater<ColumnFiltersState>) => {
			setColumnFilters(prev => {
				const next =
					typeof updaterOrValue === 'function'
						? updaterOrValue(prev)
						: updaterOrValue

				// Convert column filters to our filter format
				const newFilters = next.map(filter => ({
					id: filter.id,
					value: filter.value,
					operator: Array.isArray(filter.value) ? 'inArray' : 'iLike',
					variant: Array.isArray(filter.value) ? 'multiSelect' : 'text',
				}))

				debouncedSetFilters(newFilters)
				return next
			})
		},
		[debouncedSetFilters],
	)

	const table = useReactTable({
		...tableProps,
		columns,
		initialState,
		pageCount,
		state: {
			pagination,
			sorting: parsedSorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		defaultColumn: {
			...tableProps.defaultColumn,
			enableColumnFilter: true,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
	})

	return { table, shallow, debounceMs, throttleMs }
}
