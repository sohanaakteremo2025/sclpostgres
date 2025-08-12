// components/navbar.tsx
'use client'
import React from 'react'
import { NavLinks } from './navLinks'
import { MobileNav } from './mobileNav'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { useUser } from '@/context/user-context'
import { ThemeToggle } from '../theme-toggle'

export function Navbar() {
	const [isScrolled, setIsScrolled] = React.useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
	const user = useUser()

	React.useEffect(() => {
		if (typeof window === 'undefined') return

		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0)
		}

		handleScroll()
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled
					? 'bg-primary/10 backdrop-blur-lg shadow-md py-2'
					: 'bg-primary/20 backdrop-blur-lg py-4'
			}`}
		>
			<div className="container mx-auto px-6">
				<div className="flex items-center justify-between lg:justify-start lg:space-x-12">
					<Logo />

					<div className="hidden lg:flex flex-1 items-center justify-center text-white">
						<NavLinks />
					</div>
					<div>
						<ThemeToggle />
					</div>
					{user ? (
						<Link href="/dashboard" className="lg:block">
							<button className="bg-emerald-600 hover:bg-emerald-700 text-white md:px-6 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
								Dashboard <LogIn />
							</button>
						</Link>
					) : (
						<Link href="/login" className="lg:block">
							<button className="bg-emerald-600 hover:bg-emerald-700 text-white md:px-6 md:py-2 py-1 px-2 rounded-lg font-medium transition-colors flex items-center gap-2">
								Sign In <LogIn />
							</button>
						</Link>
					)}

					<MobileNav
						user={user}
						isOpen={isMobileMenuOpen}
						onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					/>
				</div>
			</div>
		</nav>
	)
}
