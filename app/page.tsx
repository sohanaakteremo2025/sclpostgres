import Footer from '@/components/pages/home-company/footer'
import Header from '@/components/pages/home-company/header'
import Hero from '@/components/pages/home-company/hero'
import Features from '@/components/pages/home-company/features'
import Testimonials from '@/components/pages/home-company/testimonials'
import CTA from '@/components/pages/home-company/cta'
import Pricing from '@/components/pages/home-company/pricing'

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main>
				<Hero />
				<Features />
				<Testimonials />
				<Pricing />
				<CTA />
			</main>
			<Footer />
		</div>
	)
}
