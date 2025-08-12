import Link from 'next/link'
import CmsLoginButton from '@/components/auth/login-button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Header() {
	return (
		<header className="bg-white shadow-sm">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div>
					<img src="/company/logo.png" className="w-32" alt="" />
				</div>
				<nav className="hidden md:flex space-x-8">
					<Link href="#features" className="text-gray-600 hover:text-gray-900">
						Features
					</Link>
					<Link
						href="#testimonials"
						className="text-gray-600 hover:text-gray-900"
					>
						Testimonials
					</Link>
					<Link href="#pricing" className="text-gray-600 hover:text-gray-900">
						Pricing
					</Link>
				</nav>
				<div className="flex items-center space-x-4">
					<ThemeToggle />
					<CmsLoginButton />
				</div>
			</div>
		</header>
	)
}
