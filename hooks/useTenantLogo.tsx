// useTenantLogo.ts
import { useState, useEffect, useCallback } from 'react'
import { getCachedTenantLogoByDomain } from '@/lib/actions/tanant' // Update this import to match your actual server action path

interface Tenant {
	logo: string
	name: string
}

interface UseTenantLogoResult {
	tenant: Tenant | null
	isLoading: boolean
	error: Error | null
	refetch: () => Promise<void>
}

export function useTenantLogo(domain: string): UseTenantLogoResult {
	const [tenant, setTenant] = useState<Tenant | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchTenantLogo = useCallback(async () => {
		if (!domain) {
			setError(new Error('Domain is required'))
			setIsLoading(false)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const tenantData = await getCachedTenantLogoByDomain(domain)
			setTenant(tenantData)
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error('Failed to fetch tenant data'),
			)
			console.error('Error fetching tenant logo:', err)
		} finally {
			setIsLoading(false)
		}
	}, [domain])

	// Fetch data on mount and when domain changes
	useEffect(() => {
		fetchTenantLogo()
	}, [fetchTenantLogo])

	// Return the tenant data, loading state, error state, and refetch function
	return {
		tenant,
		isLoading,
		error,
		refetch: fetchTenantLogo,
	}
}
