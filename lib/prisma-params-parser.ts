// lib/search-params-parser.ts
import {
	createSearchParamsCache,
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
} from 'nuqs/server'
import { z } from 'zod'

const sortingItemSchema = z.object({
	id: z.string(),
	desc: z.boolean(),
})

const filterItemSchema = z.object({
	id: z.string(),
	value: z.union([z.string(), z.array(z.string())]),
	operator: z.enum([
		'iLike',
		'notILike',
		'eq',
		'ne',
		'inArray',
		'notInArray',
		'lt',
		'lte',
		'gt',
		'gte',
		'isBetween',
		'isRelativeToToday',
		'isEmpty',
		'isNotEmpty',
	]),
	variant: z.enum([
		'text',
		'multiSelect',
		'range',
		'dateRange',
		'date',
		'number',
		'boolean',
	]),
	filterId: z.string(),
})

export const createDataTableSearchParamsCache = () => {
	return createSearchParamsCache({
		page: parseAsInteger.withDefault(1),
		perPage: parseAsInteger.withDefault(10),
		sort: parseAsArrayOf(sortingItemSchema).withDefault([]),
		filters: parseAsArrayOf(filterItemSchema).withDefault([]),
		search: parseAsString.withDefault(''),
		joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
	})
}

// Additional parsers for specific use cases
export const createCustomSearchParamsCache = (
	additionalParams: Record<string, any> = {},
) => {
	return createSearchParamsCache({
		page: parseAsInteger.withDefault(1),
		perPage: parseAsInteger.withDefault(10),
		sort: parseAsArrayOf(sortingItemSchema).withDefault([]),
		filters: parseAsArrayOf(filterItemSchema).withDefault([]),
		search: parseAsString.withDefault(''),
		joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
		...additionalParams,
	})
}

// Helper function to validate filters
export function validateFilters(filters: any[]): boolean {
	try {
		z.array(filterItemSchema).parse(filters)
		return true
	} catch {
		return false
	}
}

// Helper function to validate sorting
export function validateSorting(sorting: any[]): boolean {
	try {
		z.array(sortingItemSchema).parse(sorting)
		return true
	} catch {
		return false
	}
}
