'use server'

import { prisma } from '@/lib/db'
import { TenantStatus } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

interface TenantBasic {
	id: string
	domain: string
	status: TenantStatus
}

interface TenantFull {
	id: string
	logo: string
	name: string
	email: string
	phone: string
	address: string
	domain: string
	status: TenantStatus
	createdAt: Date
	updatedAt: Date
}

interface TenantPublic {
	id: string
	logo: string
	name: string
	domain: string
	status: TenantStatus
}

/**
 * Fastest lookup - just ID and status check
 */
const getCachedTenantId = unstable_cache(
	async (domain: string): Promise<string> => {
		console.log(`🔍 DB lookup for tenant ID: ${domain}`)

		const tenant = await prisma.tenant.findUnique({
			where: {
				domain,
				status: TenantStatus.ACTIVE, // Only get active tenants
			},
			select: { id: true },
		})

		if (!tenant) {
			throw new Error('Tenant not found')
		}

		console.log(`✅ Tenant ID: ${tenant.id}`)

		return tenant.id
	},
	['tenant-id-lookup'],
	{
		tags: ['tenant', 'tenant-id'],
		revalidate: 600, // 10 minutes - short cache for critical data
	},
)

/**
 * Basic tenant info for common operations
 */
const getCachedTenantBasic = unstable_cache(
	async (domain: string): Promise<TenantBasic> => {
		console.log(`🔍 DB lookup for basic tenant: ${domain}`)

		const tenant = await prisma.tenant.findUnique({
			where: { domain },
			select: {
				id: true,
				domain: true,
				status: true,
			},
		})

		if (!tenant) {
			throw new Error('Tenant not found')
		}

		console.log(`✅ Tenant Basic: ${JSON.stringify(tenant)}`)

		return tenant
	},
	['tenant-basic-lookup'],
	{
		tags: ['tenant', 'tenant-basic'],
		revalidate: 900, // 15 minutes
	},
)

/**
 * Public tenant info for display purposes
 */
const getCachedTenantPublic = unstable_cache(
	async (domain: string): Promise<TenantPublic> => {
		console.log(`🔍 DB lookup for public tenant: ${domain}`)

		const tenant = await prisma.tenant.findUnique({
			where: {
				domain,
				status: TenantStatus.ACTIVE,
			},
			select: {
				id: true,
				logo: true,
				name: true,
				domain: true,
				address: true,
				phone: true,
				email: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		if (!tenant) {
			throw new Error('Tenant not found')
		}

		console.log(`✅ Tenant Public: ${JSON.stringify(tenant)}`)

		return tenant
	},
	['tenant-public-lookup'],
	{
		tags: ['tenant', 'tenant-public'],
		revalidate: 1800, // 30 minutes - longer cache for display data
	},
)

/**
 * Full tenant data for admin operations
 */
const getCachedTenantFull = unstable_cache(
	async (domain: string): Promise<TenantFull> => {
		console.log(`🔍 DB lookup for full tenant: ${domain}`)

		const tenant = await prisma.tenant.findUnique({
			where: { domain },
			// Get all fields
		})

		if (!tenant) {
			throw new Error('Tenant not found')
		}

		console.log(`✅ Tenant Full: ${JSON.stringify(tenant)}`)

		return tenant
	},
	['tenant-full-lookup'],
	{
		tags: ['tenant', 'tenant-full'],
		revalidate: 3600, // 1 hour - longest cache for full data
	},
)

export async function getTenantId(): Promise<string> {
	const headerList = await headers()
	const domain = headerList.get('x-tenant-subdomain')

	if (!domain) {
		throw new Error('Tenant domain not found in headers')
	}

	return await getCachedTenantId(domain)
}

/**
 * Get basic tenant info with status check
 */
export async function getTenantBasic(): Promise<TenantBasic> {
	const headerList = await headers()
	const domain = headerList.get('x-tenant-subdomain')

	if (!domain) {
		throw new Error('Tenant domain not found in headers')
	}

	const tenant = await getCachedTenantBasic(domain)

	// Additional status check
	if (tenant.status !== TenantStatus.ACTIVE) {
		return notFound()
	}

	return tenant
}

/**
 * Get public tenant info for UI display
 */
export async function getTenantPublic(): Promise<TenantPublic> {
	const headerList = await headers()
	const domain = headerList.get('x-tenant-subdomain')

	if (!domain) {
		throw new Error('Tenant domain not found in headers')
	}

	return await getCachedTenantPublic(domain)
}

/**
 * Get full tenant data (use sparingly)
 */
export async function getTenantFull(): Promise<TenantFull> {
	const headerList = await headers()
	const domain = headerList.get('x-tenant-subdomain')

	if (!domain) {
		throw new Error('Tenant domain not found in headers')
	}

	return await getCachedTenantFull(domain)
}

/**
 * Check if tenant exists and is active (lightweight check)
 */
export async function isTenantActive(): Promise<boolean> {
	try {
		const tenant = await getTenantBasic()
		return tenant.status === TenantStatus.ACTIVE
	} catch {
		return false
	}
}
