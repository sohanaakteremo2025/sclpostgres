import { getCachedTenantByDomain } from '@/lib/actions/tanant'
import EducationLandingPage from '@/components/pages/EducationLandingPage'

export default async function Home({
	params,
}: {
	params: Promise<{ domain: string }>
}) {
	const { domain } = await params
	const tenant = await getCachedTenantByDomain(domain)

	return <EducationLandingPage tenant={tenant as any} />
}
