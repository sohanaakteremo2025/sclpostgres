'use server'
import { getPrismaClient } from '@/lib/db'
import { parseHostname } from '@/utils/parseHostname'
import { headers } from 'next/headers'
export const getSubdomainDB = async () => {
	const { currentHost: domain } = parseHostname(
		(await headers()).get('host') || '',
	)
	const prisma = getPrismaClient(domain)
	return prisma
}
