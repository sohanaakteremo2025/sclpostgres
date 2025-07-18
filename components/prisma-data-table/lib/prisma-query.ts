// lib/prisma-query.ts
'use server'
import { prisma } from '@/lib/db'
import { SearchParams } from '@/types'
import { validateSearchParams } from './search-params-validation'
import { revalidateTag, unstable_cache } from 'next/cache'
import { CACHE_KEYS, revalidateCachedData } from '@/lib/cache-actions'

export interface QueryOptions {
	page?: number
	perPage?: number
	sort?: Array<{ id: string; desc: boolean }>
	filters?: Array<{
		id: string
		value: string | string[]
		operator: string
		variant: string
	}>
	tenantId?: string
}

export interface QueryResult<T> {
	data: T[]
	pageCount: number
	total: number
}

interface QueryModelParams<T> {
	model: keyof typeof prisma
	searchParams: SearchParams
	select?: Record<string, any>
	where?: Record<string, any>
	tenantId: string // Required - no more domain resolution inside cache
	cacheOptions?: {
		revalidate?: number | false
		cacheKey: string // Required - use CACHE_KEYS pattern
		tags: string[] // Required - use CACHE_KEYS pattern
	}
}

// Core query function (without caching) - no headers/async context issues
async function executeQuery<T>(
	model: string,
	searchParams: SearchParams,
	tenantId: string,
	select?: Record<string, any>,
	where?: Record<string, any>,
): Promise<QueryResult<T>> {
	const {
		page = 1,
		perPage = 10,
		sort = [],
		filters = [],
	} = searchParamsValidation(searchParams)

	try {
		const modelDelegate = (prisma as any)[model]
		if (!modelDelegate) {
			throw new Error(`Model ${model} not found`)
		}

		const offset = (page - 1) * perPage
		const whereClause = buildWhereClause(filters, tenantId, where)
		const orderBy = buildOrderBy(sort)

		const queryOptions: any = {
			where: whereClause,
			orderBy,
			skip: offset,
			take: perPage,
		}

		if (select && Object.keys(select).length > 0) {
			queryOptions.select = select
		}

		const [data, total] = await Promise.all([
			modelDelegate.findMany(queryOptions),
			modelDelegate.count({ where }),
		])

		const pageCount = Math.ceil(total / perPage)

		return {
			data,
			pageCount,
			total,
		}
	} catch (error) {
		console.error(`❌ Error querying ${model}:`, error)
		throw error // Throw instead of returning empty - let caller handle
	}
}

function buildWhereClause(
	filters: any[],
	tenantId: string,
	where?: Record<string, any>,
): any {
	let whereClause: any = {}

	if (tenantId) {
		whereClause.tenantId = tenantId
	}

	if (where) {
		whereClause = { ...whereClause, ...where }
	}

	for (const filter of filters) {
		if (
			!filter.value ||
			(Array.isArray(filter.value) && filter.value.length === 0)
		) {
			continue
		}

		// Handle nested relations (like section.class.name)
		if (filter.id.includes('.')) {
			const pathParts = filter.id.split('.')
			let currentWhere = whereClause

			// Build the nested structure
			for (let i = 0; i < pathParts.length - 1; i++) {
				const part = pathParts[i]
				currentWhere[part] = currentWhere[part] || {}
				currentWhere = currentWhere[part]
			}

			// Add the condition to the deepest level
			const lastPart = pathParts[pathParts.length - 1]
			currentWhere[lastPart] = buildFilterCondition(filter)
			continue
		}

		// Handle date fields
		if (isDateField(filter)) {
			const dateCondition = buildDateCondition(filter)
			if (dateCondition) {
				whereClause[filter.id] = dateCondition
			}
			continue
		}

		// Handle regular fields
		whereClause[filter.id] = buildFilterCondition(filter)
	}

	return whereClause
}

function isDateField(filter: any): boolean {
	return (
		filter.id.toLowerCase().includes('date') ||
		filter.id.toLowerCase().includes('created') ||
		filter.id.toLowerCase().includes('updated') ||
		filter.variant === 'date' ||
		filter.variant === 'dateRange'
	)
}

function buildDateCondition(filter: any): any | null {
	const conditions: any = {}

	if (Array.isArray(filter.value)) {
		// Handle date ranges
		if (filter.value[0] && filter.value[0] !== null) {
			const startDate = new Date(Number(filter.value[0]))
			startDate.setHours(0, 0, 0, 0)
			conditions.gte = startDate
		}

		if (filter.value[1] && filter.value[1] !== null) {
			const endDate = new Date(Number(filter.value[1]))
			endDate.setHours(23, 59, 59, 999)
			conditions.lte = endDate
		}
	} else if (
		typeof filter.value === 'string' ||
		typeof filter.value === 'number'
	) {
		// Handle single date
		const date = new Date(Number(filter.value))
		const startOfDay = new Date(date)
		startOfDay.setHours(0, 0, 0, 0)
		const endOfDay = new Date(date)
		endOfDay.setHours(23, 59, 59, 999)

		conditions.gte = startOfDay
		conditions.lte = endOfDay
	}

	return Object.keys(conditions).length > 0 ? conditions : null
}

function buildFilterCondition(filter: any): any {
	switch (filter.operator) {
		case 'iLike':
			if (filter.variant === 'text' && typeof filter.value === 'string') {
				return {
					contains: filter.value,
					mode: 'insensitive',
				}
			}
			return filter.value

		case 'eq':
			if (filter.variant === 'boolean') {
				return filter.value === 'true'
			}
			return filter.value

		case 'inArray':
			if (Array.isArray(filter.value)) {
				const validValues = filter.value.filter(
					(v: any) =>
						v !== null &&
						v !== undefined &&
						(typeof v !== 'string' || v.trim() !== ''),
				)
				if (validValues.length > 0) {
					return { in: validValues }
				}
			}
			return filter.value

		case 'gte':
			if (filter.variant === 'number' || filter.variant === 'range') {
				return { gte: Number(filter.value) }
			}
			return filter.value

		case 'lte':
			if (filter.variant === 'number' || filter.variant === 'range') {
				return { lte: Number(filter.value) }
			}
			return filter.value

		case 'isBetween':
			if (Array.isArray(filter.value) && filter.value.length === 2) {
				if (filter.variant === 'number' || filter.variant === 'range') {
					const conditions: any = {}
					if (filter.value[0] && filter.value[0].toString().trim() !== '') {
						conditions.gte = Number(filter.value[0])
					}
					if (filter.value[1] && filter.value[1].toString().trim() !== '') {
						conditions.lte = Number(filter.value[1])
					}
					if (Object.keys(conditions).length > 0) {
						return conditions
					}
				}
			}
			return filter.value

		default:
			console.warn(
				`Unhandled filter operator: ${filter.operator} for field ${filter.id}`,
			)
			return filter.value
	}
}

function buildOrderBy(sort: any[]): any[] {
	if (sort.length === 0) {
		return [{ createdAt: 'desc' }]
	}

	return sort.map(sortItem => ({
		[sortItem.id]: sortItem.desc ? 'desc' : 'asc',
	}))
}

// No need for complex cache key generation
// Use CACHE_KEYS pattern directly

// Main exported function with caching
export async function queryModel<T>({
	model,
	searchParams,
	select,
	tenantId,
	cacheOptions,
	where,
}: QueryModelParams<T>): Promise<QueryResult<T>> {
	// Require cacheOptions to be explicit
	if (!cacheOptions) {
		throw new Error('cacheOptions with cacheKey and tags are required')
	}

	const { revalidate = 60, cacheKey, tags } = cacheOptions

	// Create cached version of the query
	const cachedQuery = unstable_cache(
		async (
			model: string,
			searchParams: SearchParams,
			select: Record<string, any> | undefined,
			tenantId: string,
			where: Record<string, any> | undefined,
		) => {
			return executeQuery<T>(model, searchParams, tenantId, select, where)
		},
		[cacheKey], // Use provided cache key directly
		{
			revalidate,
			tags, // Use provided tags directly
		},
	)

	return cachedQuery(String(model), searchParams, select, tenantId, where)
}

// Utility function to invalidate cache by model and tenant
export async function invalidateModelCache(
	model: string,
	tenantId?: string,
	customTags: string[] = [],
) {
	const tagsToInvalidate = [
		model, // Invalidate all queries for this model
		...(tenantId ? [`tenant-${tenantId}`] : []), // Tenant-specific
		...customTags, // Custom tags
	]

	await revalidateCachedData(tagsToInvalidate)
}

// Helper function to validate search params
function searchParamsValidation(searchParams: SearchParams) {
	const validatedParams = validateSearchParams(searchParams)

	// Add basic search filter if provided
	const filters = [...validatedParams.filters]
	if (validatedParams.search) {
		filters.push({
			id: 'name', // Assume most models have a name field
			value: validatedParams.search,
			operator: 'iLike',
			variant: 'text',
		})
	}

	return {
		...validatedParams,
		filters,
	}
}
