import Link from 'next/link'
import { Facebook, Twitter, LinkedinIcon as LinkedIn } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function Footer() {
	return (
		<footer className="bg-gray-800 text-white py-12">
			<div className="max-w-7xl mx-auto px-4">
				<div className="grid md:grid-cols-4 gap-8">
					<div>
						<div className="w-fit">Logo</div>
						<p className="text-gray-400">
							Empowering educational institutions with cutting-edge management
							solutions.
						</p>
					</div>
					<div>
						<h4 className="text-lg font-semibold mb-4">Quick Links</h4>
						<ul className="space-y-2">
							<li>
								<Link href="#" className="text-gray-400 hover:text-white">
									Home
								</Link>
							</li>
							<li>
								<Link href="#" className="text-gray-400 hover:text-white">
									Features
								</Link>
							</li>
							<li>
								<Link href="#" className="text-gray-400 hover:text-white">
									Pricing
								</Link>
							</li>
							<li>
								<Link href="#" className="text-gray-400 hover:text-white">
									Contact
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="text-lg font-semibold mb-4">Legal</h4>
						<ul className="space-y-2">
							<li>
								<Link href="#" className="text-gray-400 hover:text-white">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link href="#" className="text-gray-400 hover:text-white">
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
						<div className="flex space-x-4">
							<Link href="#" className="text-gray-400 hover:text-white">
								<Facebook className="w-6 h-6" />
							</Link>
							<Link href="#" className="text-gray-400 hover:text-white">
								<Twitter className="w-6 h-6" />
							</Link>
							<Link href="#" className="text-gray-400 hover:text-white">
								<LinkedIn className="w-6 h-6" />
							</Link>
						</div>
					</div>
				</div>
				<div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
					<p>
						&copy; {new Date().getFullYear()} {siteConfig.name}. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	)
}
