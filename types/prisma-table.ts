// types/data-table.ts

export interface SearchParams {
	[key: string]: string | string[] | undefined
}

export interface DataTableSearchParams {
	page?: number
	perPage?: number
	sort?: Array<{ id: string; desc: boolean }>
	filters?: Array<{
		id: string
		value: string | string[]
		operator: FilterOperator
		variant: FilterVariant
		filterId: string
	}>
	search?: string
	joinOperator?: JoinOperator
}

export interface DataTableResult<T> {
	data: T[]
	pageCount: number
	totalCount: number
}

export interface DataTableRowAction<T> {
	variant: 'update' | 'delete' | 'view'
	row: { original: T }
}

export type JoinOperator = 'and' | 'or'

export type FilterOperator =
	| 'iLike'
	| 'notILike'
	| 'eq'
	| 'ne'
	| 'inArray'
	| 'notInArray'
	| 'lt'
	| 'lte'
	| 'gt'
	| 'gte'
	| 'isBetween'
	| 'isRelativeToToday'
	| 'isEmpty'
	| 'isNotEmpty'

export type FilterVariant =
	| 'text'
	| 'multiSelect'
	| 'range'
	| 'dateRange'
	| 'date'
	| 'number'
	| 'boolean'

export type FilterType = 'string' | 'number' | 'date' | 'boolean' | 'enum'

export interface ExtendedColumnSort<TData> {
	id: keyof TData | string
	desc: boolean
}

export interface ExtendedColumnFilter<TData> {
	id: keyof TData | string
	value: string | string[]
	operator: FilterOperator
	variant: FilterVariant
	filterId: string
}

// Column meta interface for filter configuration
export interface ColumnMeta {
	label: string
	placeholder?: string
	variant: FilterVariant
	options?: Array<{
		label: string
		value: string | number
		count?: number
		icon?: React.ComponentType
	}>
	range?: [number, number]
	unit?: string
	icon?: React.ComponentType
}

// Feature flags interface
export interface FeatureFlags {
	enableAdvancedFilter?: boolean
	filterFlag?: 'advancedFilters' | 'filterMenu'
	enableBulkActions?: boolean
	enableColumnVisibility?: boolean
	enableExport?: boolean
}
