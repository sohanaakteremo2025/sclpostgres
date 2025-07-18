import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../components/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate } from '@/lib/format'
import { ActionsCell } from '../components/action-cells'
import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { UserAvatar } from '@/components/user-avatar'

// Clean filter types - added 'range'
export type FilterType =
	| 'text'
	| 'select'
	| 'multiSelect'
	| 'dateRange'
	| 'number'
	| 'range'

export interface FilterConfig {
	type: FilterType
	placeholder?: string
	options?: Array<{ label: string; value: string; icon?: LucideIcon }>
	// Range-specific properties
	range?: [number, number] // [min, max]
	unit?: string
	step?: number
}

// Enhanced column config with clean filter API
export interface ColumnConfig<TData = any, TValue = any> {
	type:
		| 'text'
		| 'badge'
		| 'date'
		| 'custom'
		| 'actions'
		| 'select'
		| 'number'
		| 'image'
	header?: string
	width?: number
	sortable?: boolean
	hidden?: boolean

	// CLEAN FILTER API
	enableFilter?: boolean
	filter?: FilterConfig

	// Text specific
	icon?: LucideIcon
	className?: string

	// Badge specific
	variant?: 'default' | 'secondary' | 'outline' | 'destructive'
	getVariant?: (
		value: TValue,
	) => 'default' | 'secondary' | 'outline' | 'destructive'

	// Date specific
	format?: (date: Date) => string

	// Number specific
	unit?: string
	precision?: number

	// Custom render - properly typed
	render?: (value: TValue, row: TData) => React.ReactNode

	// Actions specific - FIXED: Changed to flexible string array
	actions?: string[]
	actionConfig?: Record<
		string,
		{
			label?: string
			icon?: LucideIcon
			onClick?: (row: TData) => void
			className?: string
			variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
			disabled?: (row: TData) => boolean
		}
	>
}

// Utility type to extract nested property types
type NestedAccessor<T, K extends string> = K extends `${infer P}.${infer Rest}`
	? P extends keyof T
		? T[P] extends Record<string, any>
			? NestedAccessor<T[P], Rest>
			: never
		: never
	: K extends keyof T
		? T[K]
		: never

// FIXED: Better nested paths extraction that actually works with autocomplete
type NestedPaths<T, Depth extends number = 3> = Depth extends 0
	? never
	: T extends object
		? {
				[K in keyof T]: K extends string
					? T[K] extends object
						? K | `${K}.${NestedPaths<T[K], Prev[Depth]>}`
						: K
					: never
			}[keyof T]
		: never

// Helper type for recursion depth limiting
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// FIXED: Partial Record to make all properties optional while preserving autocomplete
export type ColumnSchema<TData extends Record<string, any>> = Partial<
	Record<
		keyof TData | NestedPaths<TData> | 'select' | 'actions',
		ColumnConfig<TData, any>
	>
> & {
	// This index signature allows any string key while preserving autocomplete for known keys
	[K: string]: ColumnConfig<TData, any>
}

// Helper type to create accessor function for nested paths
const createNestedAccessor = <TData,>(path: string) => {
	const parts = path.split('.')
	return (row: TData): any => {
		let value: any = row
		for (const part of parts) {
			value = value?.[part]
			if (value === undefined) break
		}
		return value
	}
}

// Helper function for better type inference when defining columns
export function defineColumn<TData, TValue = any>(
	config: ColumnConfig<TData, TValue>,
): ColumnConfig<TData, TValue> {
	return config
}

// Enhanced createColumns with better type support
export function createColumns<TData extends Record<string, any>>(
	schema: ColumnSchema<TData>,
): ColumnDef<TData>[] {
	return Object.entries(schema).map(([key, cfg]) => {
		const config = cfg as ColumnConfig<TData>
		const isNestedPath = key.includes('.')
		const accessorFn = isNestedPath
			? createNestedAccessor<TData>(key)
			: undefined

		const baseColumn: ColumnDef<TData> = {
			id: key,
			accessorKey:
				!isNestedPath && key !== 'select' && key !== 'actions'
					? (key as keyof TData)
					: undefined,
			accessorFn: accessorFn,
			header:
				config.type === 'select'
					? ({ table }) => (
							<Checkbox
								checked={
									table.getIsAllPageRowsSelected() ||
									(table.getIsSomePageRowsSelected() && 'indeterminate')
								}
								onCheckedChange={value =>
									table.toggleAllPageRowsSelected(!!value)
								}
								aria-label="Select all"
							/>
						)
					: ({ column }) => (
							<DataTableColumnHeader
								column={column}
								title={config.header || formatColumnHeader(key)}
							/>
						),
			enableSorting: config.sortable ?? true,
			enableHiding: config.hidden !== undefined ? !config.hidden : true,
			enableColumnFilter: config.enableFilter ?? false,
			size: config.width,

			meta:
				config.enableFilter && config.filter
					? ({
							label: config.header || formatColumnHeader(key),
							variant: config.filter.type,
							placeholder: config.filter.placeholder,
							options: config.filter.options,
							range: config.filter.range,
							unit: config.filter.unit || config.unit,
							step: config.filter.step,
							icon: config.icon,
						} as any)
					: undefined,
		}

		// Handle different column types
		switch (config.type) {
			case 'select':
				return {
					...baseColumn,
					cell: ({ row }) => (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={value => row.toggleSelected(!!value)}
							aria-label="Select row"
						/>
					),
					enableSorting: false,
					enableHiding: false,
					size: 40,
				}

			case 'text':
				return {
					...baseColumn,
					cell: ({ getValue }) => {
						const value = getValue() as string
						return (
							<div className="flex items-center gap-2">
								{config.icon &&
									React.createElement(config.icon, {
										className: 'h-4 w-4 text-muted-foreground',
									})}
								<span className={config.className || 'max-w-[200px] truncate'}>
									{value}
								</span>
							</div>
						)
					},
				}

			case 'badge':
				return {
					...baseColumn,
					cell: ({ getValue }) => {
						const value = getValue()
						if (!value) return <span className="text-muted-foreground">—</span>

						const variant =
							config.getVariant?.(value) || config.variant || 'default'
						return (
							<Badge variant={variant}>
								{config.icon &&
									React.createElement(config.icon, {
										className: 'mr-1 h-3 w-3',
									})}
								{value.toString()}
							</Badge>
						)
					},
				}

			case 'date':
				return {
					...baseColumn,
					cell: ({ getValue }) => {
						const date = getValue() as Date
						return config.format ? config.format(date) : formatDate(date)
					},
				}

			case 'number':
				return {
					...baseColumn,
					cell: ({ getValue }) => {
						const value = getValue() as number
						if (value === null || value === undefined) {
							return <span className="text-muted-foreground">—</span>
						}

						const formattedValue =
							config.precision !== undefined
								? value.toFixed(config.precision)
								: value.toString()

						return (
							<div className="text-right">
								{formattedValue}
								{config.unit && (
									<span className="text-muted-foreground ml-1">
										{config.unit}
									</span>
								)}
							</div>
						)
					},
				}

			case 'image':
				return {
					...baseColumn,
					cell: ({ getValue }) => {
						const value = getValue() as string
						return (
							<div className="flex items-center gap-2">
								{config.icon &&
									React.createElement(config.icon, {
										className: 'h-4 w-4 text-muted-foreground',
									})}
								<UserAvatar src={value} firstName="Logo" />
							</div>
						)
					},
				}

			case 'actions':
				return {
					...baseColumn,
					cell: ({ row }) => (
						<ActionsCell
							row={row}
							options={config.actions || ['view', 'delete']}
							actionConfig={config.actionConfig}
						/>
					),
					enableSorting: false,
					size: 40,
				}

			case 'custom':
				return {
					...baseColumn,
					cell: ({ row, getValue }) => config.render!(getValue(), row.original),
				}

			default:
				return baseColumn
		}
	})
}

// Alternative: Strongly typed version for specific action sets
export function createTypedColumns<
	TData extends Record<string, any>,
	TActions extends string = string,
>(
	schema: Partial<
		Record<
			keyof TData | NestedPaths<TData> | 'select' | 'actions',
			ColumnConfig<TData, any> & {
				// Override actions with typed version when TActions is specified
				actions?: TActions[]
				actionConfig?: Record<
					TActions,
					{
						label?: string
						icon?: LucideIcon
						onClick?: (row: TData) => void
						className?: string
						variant?:
							| 'default'
							| 'secondary'
							| 'outline'
							| 'destructive'
							| 'ghost'
						disabled?: (row: TData) => boolean
					}
				>
			}
		>
	> & { [K: string]: ColumnConfig<TData, any> },
): ColumnDef<TData>[] {
	return createColumns(schema as ColumnSchema<TData>)
}

// Helper function to format column headers from nested paths
function formatColumnHeader(key: string): string {
	return key
		.split('.')
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' → ')
}
