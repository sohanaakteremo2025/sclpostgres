import { unstable_cache, revalidateTag } from 'next/cache'

/**
 * Type for a generic async action function
 */
type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

/**
 * Create a cached version of an async function using unstable_cache
 * @param fn - The async function to cache
 * @param options - Options including cacheKey, tags, and revalidate time
 */
export function createCachedAction<T extends AsyncFunction>(
	fn: T,
	options: {
		cacheKey: string
		tags?: string[]
		revalidate?: number // seconds
	},
): T {
	const cachedFn = unstable_cache(
		async (...args: Parameters<T>) => {
			return await fn(...args)
		},
		[options.cacheKey], // must be deterministic
		{
			tags: options.tags ?? [],
			revalidate: options.revalidate ?? 60, // default: 1 minute
		},
	)

	return cachedFn as unknown as T
}

/**
 * Invalidate cache by tag(s) or path(s)
 */
export async function revalidateCachedData(tags: string[] = []) {
	tags.forEach(tag => revalidateTag(tag))
}
