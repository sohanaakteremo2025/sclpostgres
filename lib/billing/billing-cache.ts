// lib/billing-cache.ts
interface BillingStatus {
	isOverdue: boolean
	daysOverdue: number
	overdueSchedules: Array<{
		id: string
		label: string
		amount: number
		nextDueDate: Date
		daysOverdue: number
	}>
	totalOverdueAmount: number
}

interface CacheEntry {
	data: BillingStatus
	timestamp: number
	ttl: number
}

class BillingCache {
	private cache = new Map<string, CacheEntry>()
	private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

	set(key: string, data: BillingStatus, ttl = this.DEFAULT_TTL): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		})
	}

	get(key: string): BillingStatus | null {
		const entry = this.cache.get(key)
		if (!entry) return null

		const isExpired = Date.now() - entry.timestamp > entry.ttl
		if (isExpired) {
			this.cache.delete(key)
			return null
		}

		return entry.data
	}

	invalidate(key: string): void {
		this.cache.delete(key)
	}

	clear(): void {
		this.cache.clear()
	}

	cleanup(): void {
		const now = Date.now()
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key)
			}
		}
	}
}

export const billingCache = new BillingCache()

// Cleanup expired entries every 10 minutes
if (typeof window === 'undefined') {
	// Only run on server
	setInterval(
		() => {
			billingCache.cleanup()
		},
		10 * 60 * 1000,
	)
}

export type { BillingStatus }
