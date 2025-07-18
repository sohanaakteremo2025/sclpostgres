// lib/billing-client.ts
import type { BillingStatus } from './billing-cache'

export async function checkTenantBillingStatus(
	tenantId: string,
): Promise<BillingStatus | null> {
	try {
		const response = await fetch(`/api/billing/check/${tenantId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			console.error('Failed to check billing status:', response.statusText)
			return null
		}

		return await response.json()
	} catch (error) {
		console.error('Error checking billing status:', error)
		return null
	}
}

export async function invalidateTenantBillingCache(
	tenantId: string,
): Promise<void> {
	try {
		await fetch(`/api/billing/invalidate/${tenantId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})
	} catch (error) {
		console.error('Error invalidating billing cache:', error)
	}
}
