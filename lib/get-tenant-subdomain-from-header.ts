'use server'
import { parseHostname } from '@/utils/parseHostname'
import { headers } from 'next/headers'
export const getTenantSubdomain = async () => {
	const { currentHost: domain } = parseHostname(
		(await headers()).get('host') || '',
	)

	return domain
}
