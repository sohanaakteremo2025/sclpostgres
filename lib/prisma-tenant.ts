import { parseHostname } from '@/utils/parseHostname'
import { getPrismaClient } from '@/lib/db'

export function prisma(host: string) {
	const { currentHost: domain } = parseHostname(host)
	const prisma = getPrismaClient(domain)
	return prisma
}
