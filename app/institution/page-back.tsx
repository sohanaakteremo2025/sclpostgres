import { getTenantByDomain } from '@/lib/actions/tenant.action'
import { Navbar } from '@/components/navbar'
import { Contact } from '@/components/pages/home-institute/contact'
import { Features } from '@/components/pages/home-institute/features'
import { Footer } from '@/components/pages/home-institute/footer'
import { Hero } from '@/components/pages/home-institute/hero-section'
import Leadership from '@/components/pages/home-institute/leadership'
import { NoticeBoard } from '@/components/pages/home-institute/noticeboard'
import { Stats } from '@/components/pages/home-institute/stats'

// const getCachedTenant = unstable_cache(
// 	async () => getTenantByDomain(),
// 	['tenant'],
// 	{ revalidate: 3600 }, // Cache for 1 hour
// )

export default async function Home() {
	const tenant = await getTenantByDomain()
	const isMsim = tenant?.domain === 'msimdhaka'

	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<Hero data={tenant} />
			{!isMsim && <Leadership data={tenant as any} />}
			<Stats />
			<Features />
			<NoticeBoard data={tenant} />
			<Contact data={tenant} />
			<Footer data={tenant} />
		</div>
	)
}
