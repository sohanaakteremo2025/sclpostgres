'use server'
// lib/tenant/server.ts
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { siteConfig } from '@/config/site'
import { parseHostname } from './parseHostname'
import { cache } from 'react'

export const getTenant = async () => {
	const { currentHost: domain } = parseHostname(
		(await headers()).get('host') || '',
	)
	const tenant = await prisma.tenant.findUnique({
		where: { domain },
	})
	return tenant
}

export const getTenantFromRequest = cache(async () => {
	const { currentHost: domain } = parseHostname(
		(await headers()).get('host') || '',
	)
	try {
		const tenant = await prisma.tenant.findUnique({
			where: { domain },
		})

		if (!tenant) {
			return null
		}

		return tenant
	} catch (error) {
		console.error('Error fetching tenant:', error)
		return null
	}
})

export async function generateMetadata() {
	const tenant = await getTenantFromRequest()

	if (!tenant) {
		return {
			title: siteConfig.name,
			description: siteConfig.description,
			logo: siteConfig.logo,
		}
	}

	return {
		title: `${tenant.name}`,
		description: `Welcome to ${tenant.name}'s ${siteConfig.description}`,
		logo: tenant.logo,
	}
}
