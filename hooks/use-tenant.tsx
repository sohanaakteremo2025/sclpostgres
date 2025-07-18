import { useState, useEffect } from 'react'
import axios from 'axios'
import { Tenant } from '@prisma/client'
import { parseHostname } from '@/utils/parseHostname'

interface UseTenantResult {
	tenant: Tenant | null
	isLoading: boolean
	error: string | null
}

export function useTenant(): UseTenantResult {
	const [tenant, setTenant] = useState<Tenant | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const domain =
		typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : ''

	if (domain === 'localhost' || domain === '127.0.0.1' || domain === 'www') {
		return {
			tenant: null,
			isLoading: false,
			error: null,
		}
	}

	useEffect(() => {
		if (!domain) {
			setError('Domain is required')
			setIsLoading(false)
			return
		}

		const fetchTenant = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get('/api/tenant/', {
					headers: { 'x-domain': domain },
				})
				setTenant(response.data)
				setError(null)
			} catch (err: any) {
				setError(
					err.response?.data?.message ||
						err.message ||
						'Failed to fetch tenant',
				)
				setTenant(null)
			} finally {
				setIsLoading(false)
			}
		}

		fetchTenant()
	}, [domain])

	return { tenant, isLoading, error }
}

//just make a hook for returning the subdomain
export function useSubdomain() {
	const [subdomain, setSubdomain] = useState<string>('NoSubdomain')

	useEffect(() => {
		const host = window.location.hostname
		const { currentHost: subdomain } = parseHostname(host)
		setSubdomain(subdomain)
	}, [])

	return subdomain
}
