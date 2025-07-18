// lib/cache/cache.service.ts
export interface ICacheService {
	get<T>(key: string): Promise<T | null>
	set<T>(key: string, value: T, options?: CacheOptions): Promise<void>
	invalidate(tags: string[]): Promise<void>
	cached<T>(
		fn: () => Promise<T>,
		options: {
			key: string
			tags: string[]
			revalidate?: number
		},
	): Promise<T>
}

export interface CacheOptions {
	ttl?: number
	tags?: string[]
}
