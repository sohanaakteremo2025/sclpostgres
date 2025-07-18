// lib/cache/nextjs-cache.service.ts
import { unstable_cache, revalidateTag } from 'next/cache'
import { ICacheService, CacheOptions } from './cache.service'

async function get<T>(key: string): Promise<T | null> {
	// For Next.js, we mainly use the cached() method
	// This is a placeholder for direct cache access if needed
	return null
}

async function set<T>(
	key: string,
	value: T,
	options?: CacheOptions,
): Promise<void> {
	// Next.js handles caching through unstable_cache
	// This is a placeholder for direct cache setting if needed
}

async function invalidate(tags: string[]): Promise<void> {
	await Promise.all(tags.map(tag => revalidateTag(tag)))
}

async function cached<T>(
	fn: () => Promise<T>,
	options: {
		key: string
		tags: string[]
		revalidate?: number
	},
): Promise<T> {
	const cachedFn = unstable_cache(fn, [options.key], {
		tags: options.tags,
		revalidate: options.revalidate || 3600, // 1 hour default
	})

	return await cachedFn()
}

export const nextjsCacheService: ICacheService = {
	get,
	set,
	invalidate,
	cached,
}
