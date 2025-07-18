'use client'
import { useState } from 'react'
import TenantLogo from './school-logo'
import Link from 'next/link'
import InstallPWAButton from './install-pwa-app'
import { Button } from '@/components/ui/button'
import { X, Menu } from 'lucide-react'
export default function SchoolNavbar({ tenant }: { tenant: any }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
			<div className="container flex h-16 items-center justify-between">
				<TenantLogo name={tenant?.name} src={tenant?.logo} size="default" />

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-6">
					<Link
						href="#"
						className="text-sm font-medium hover:text-purple-700 transition-colors"
					>
						Home
					</Link>
					<Link
						href="#"
						className="text-sm font-medium hover:text-purple-700 transition-colors"
					>
						About
					</Link>
					<Link
						href="#"
						className="text-sm font-medium hover:text-purple-700 transition-colors"
					>
						Academics
					</Link>
					<Link
						href="#"
						className="text-sm font-medium hover:text-purple-700 transition-colors"
					>
						Admissions
					</Link>
					<Link
						href="#"
						className="text-sm font-medium hover:text-purple-700 transition-colors"
					>
						Campus Life
					</Link>
					<Link
						href="#"
						className="text-sm font-medium hover:text-purple-700 transition-colors"
					>
						Contact
					</Link>
				</nav>

				<div className="flex items-center gap-4">
					<InstallPWAButton />
					<Link href="/login" className="hidden md:block">
						<Button
							variant="outline"
							className="border-purple-700 text-purple-700 hover:bg-purple-50"
						>
							Student Portal
						</Button>
					</Link>
					<Link href="/login" className="hidden md:block">
						<Button className="bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white">
							Dashboard
						</Button>
					</Link>
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={toggleMenu}
					>
						{isMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</Button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="md:hidden">
					<div className="flex flex-col space-y-4 px-4 pt-2 pb-4 bg-white border-t">
						<Link
							href="#"
							className="text-sm font-medium py-2 hover:text-purple-700 transition-colors"
							onClick={toggleMenu}
						>
							Home
						</Link>
						<Link
							href="#"
							className="text-sm font-medium py-2 hover:text-purple-700 transition-colors"
							onClick={toggleMenu}
						>
							About
						</Link>
						<Link
							href="#"
							className="text-sm font-medium py-2 hover:text-purple-700 transition-colors"
							onClick={toggleMenu}
						>
							Academics
						</Link>
						<Link
							href="#"
							className="text-sm font-medium py-2 hover:text-purple-700 transition-colors"
							onClick={toggleMenu}
						>
							Admissions
						</Link>
						<Link
							href="#"
							className="text-sm font-medium py-2 hover:text-purple-700 transition-colors"
							onClick={toggleMenu}
						>
							Campus Life
						</Link>
						<Link
							href="#"
							className="text-sm font-medium py-2 hover:text-purple-700 transition-colors"
							onClick={toggleMenu}
						>
							Contact
						</Link>
						<div className="flex flex-col gap-3 pt-2">
							<Link href="/login">
								<Button
									variant="outline"
									className="w-full border-purple-700 text-purple-700 hover:bg-purple-50"
								>
									Student Portal
								</Button>
							</Link>
							<Link href="/login">
								<Button className="w-full bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white">
									Dashboard
								</Button>
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	)
}
