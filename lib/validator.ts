// lib/search-params-validation.ts
import {
	createSearchParamsCache,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
} from 'nuqs/server'

// Generic search params parser
export function createModelSearchParamsCache(
	additionalParams: Record<string, any> = {},
) {
	return createSearchParamsCache({
		page: parseAsInteger.withDefault(1),
		perPage: parseAsInteger.withDefault(10),
		sort: parseAsString.withDefault(''),
		// Basic text filters
		search: parseAsString.withDefault(''),
		// Advanced filter support
		filters: parseAsString.withDefault(''),
		joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
		// Feature flags
		enableAdvancedFilter: parseAsString.withDefault('false'),
		filterFlag: parseAsString.withDefault('simple'),
		...additionalParams,
	})
}

// Parse sort string into array format
export function parseSortString(
	sortString: string,
): Array<{ id: string; desc: boolean }> {
	if (!sortString) return []

	try {
		return JSON.parse(sortString)
	} catch {
		// Fallback: parse simple format like "name:desc,createdAt:asc"
		return sortString
			.split(',')
			.map(item => {
				const [id, direction] = item.split(':')
				return {
					id: id.trim(),
					desc: direction?.trim() === 'desc',
				}
			})
			.filter(item => item.id)
	}
}

// Parse filters string into array format
export function parseFiltersString(filtersString: string): Array<{
	id: string
	value: string | string[]
	operator: string
	variant: string
}> {
	if (!filtersString) return []

	try {
		return JSON.parse(filtersString)
	} catch {
		return []
	}
}

// Search params validation schema
export interface SearchParamsInput {
	page?: number
	perPage?: number
	sort?: string
	search?: string
	filters?: string
	joinOperator?: 'and' | 'or'
	enableAdvancedFilter?: string
	filterFlag?: string
	[key: string]: any
}

export function validateSearchParams(params: SearchParamsInput) {
	return {
		page: Math.max(1, params.page || 1),
		perPage: Math.min(100, Math.max(1, params.perPage || 10)),
		sort: parseSortString(params.sort || ''),
		search: params.search || '',
		filters: parseFiltersString(params.filters || ''),
		joinOperator: (params.joinOperator === 'or' ? 'or' : 'and') as 'and' | 'or',
		enableAdvancedFilter: params.enableAdvancedFilter === 'true',
		filterFlag: params.filterFlag || 'simple',
	}
}
