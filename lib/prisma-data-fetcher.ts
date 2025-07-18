// lib/data-table-server.ts
import { prisma } from '@/lib/db'
import { filterColumns } from '@/lib/filter-columns'
import type {
	DataTableSearchParams,
	DataTableResult,
	FilterType,
} from '@/types/prisma-table'
import type { ExtendedColumnFilter, JoinOperator } from '@/types/data-table'

interface GetDataTableDataOptions<T> {
	modelName: keyof typeof prisma
	searchParams: DataTableSearchParams
	tenantId?: string
	include?: Record<string, boolean | object>
	searchableFields?: string[]
	filterableFields?: Record<string, FilterType>
	tenantField?: string
	joinOperator?: JoinOperator
}

export async function getDataTableData<T = any>({
	modelName,
	searchParams,
	tenantId,
	include = {},
	searchableFields = [],
	filterableFields = {},
	tenantField = 'tenantId',
	joinOperator = 'and',
}: GetDataTableDataOptions<T>): Promise<DataTableResult<T>> {
	const {
		page = 1,
		perPage = 10,
		sort = [],
		filters = [],
		search = '',
	} = searchParams

	const model = prisma[modelName] as any

	if (!model) {
		throw new Error(`Model ${String(modelName)} not found`)
	}

	// Build where clause
	const where: any = {}

	// Add tenant filter if provided
	if (tenantId && tenantField) {
		where[tenantField] = tenantId
	}

	// Add search filter
	if (search && searchableFields.length > 0) {
		where.OR = searchableFields.map(field => ({
			[field]: {
				contains: search,
				mode: 'insensitive',
			},
		}))
	}

	// Add advanced filters using the existing filterColumns utility
	if (filters.length > 0) {
		const validFilters = filters.filter(
			filter => filterableFields[filter.id] !== undefined,
		) as ExtendedColumnFilter<T>[]

		if (validFilters.length > 0) {
			const filterConditions = filterColumns<any>({
				filters: validFilters,
				joinOperator,
			})

			if (filterConditions) {
				if (where.OR && search) {
					// If we have search conditions, we need to combine them properly
					where.AND = [
						{ OR: where.OR }, // Search conditions
						filterConditions, // Filter conditions
					]
					delete where.OR
				} else {
					Object.assign(where, filterConditions)
				}
			}
		}
	}

	// Build orderBy clause
	const orderBy: any[] = []
	for (const sortItem of sort) {
		orderBy.push({
			[sortItem.id]: sortItem.desc ? 'desc' : 'asc',
		})
	}

	// Calculate pagination
	const skip = (page - 1) * perPage
	const take = perPage

	try {
		// Execute queries in parallel
		const [data, totalCount] = await Promise.all([
			model.findMany({
				where,
				include,
				orderBy: orderBy.length > 0 ? orderBy : [{ createdAt: 'desc' }],
				skip,
				take,
			}),
			model.count({ where }),
		])

		const pageCount = Math.ceil(totalCount / perPage)

		return {
			data: data as T[],
			pageCount,
			totalCount,
		}
	} catch (error) {
		console.error(`Error fetching data for model ${String(modelName)}:`, error)
		throw new Error(`Failed to fetch ${String(modelName)} data`)
	}
}

// Helper function to get counts for filter options
export async function getFilterCounts<T = any>(
	modelName: keyof typeof prisma,
	field: string,
	tenantId?: string,
	tenantField: string = 'tenantId',
): Promise<Record<string, number>> {
	const model = prisma[modelName] as any

	if (!model) {
		throw new Error(`Model ${String(modelName)} not found`)
	}

	const where: any = {}
	if (tenantId && tenantField) {
		where[tenantField] = tenantId
	}

	try {
		const counts = await model.groupBy({
			by: [field],
			where,
			_count: {
				_all: true,
			},
		})

		return counts.reduce((acc: Record<string, number>, item: any) => {
			acc[item[field]] = item._count._all
			return acc
		}, {})
	} catch (error) {
		console.error(
			`Error getting filter counts for ${String(modelName)}.${field}:`,
			error,
		)
		return {}
	}
}

// Helper function to get range values for numeric fields
export async function getFieldRange<T = any>(
	modelName: keyof typeof prisma,
	field: string,
	tenantId?: string,
	tenantField: string = 'tenantId',
): Promise<{ min: number; max: number }> {
	const model = prisma[modelName] as any

	if (!model) {
		throw new Error(`Model ${String(modelName)} not found`)
	}

	const where: any = {}
	if (tenantId && tenantField) {
		where[tenantField] = tenantId
	}

	try {
		const result = await model.aggregate({
			where,
			_min: { [field]: true },
			_max: { [field]: true },
		})

		return {
			min: result._min[field] || 0,
			max: result._max[field] || 100,
		}
	} catch (error) {
		console.error(
			`Error getting field range for ${String(modelName)}.${field}:`,
			error,
		)
		return { min: 0, max: 100 }
	}
}
