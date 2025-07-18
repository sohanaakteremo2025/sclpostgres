import React from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

interface MobileNavProps {
	isOpen: boolean
	onToggle: () => void
	user: any
}

export function MobileNav({ isOpen, onToggle, user }: MobileNavProps) {
	const [openSection, setOpenSection] = React.useState<string | null>(null)

	// const links = {
	// 	about: [
	// 		{ title: 'Our History', href: '#history' },
	// 		{ title: 'Mission & Vision', href: '#mission' },
	// 		{ title: 'Leadership', href: '#leadership' },
	// 	],
	// 	academics: [
	// 		{ title: 'Primary School', href: '#primary' },
	// 		{ title: 'Secondary School', href: '#secondary' },
	// 		{ title: 'Curriculum', href: '#curriculum' },
	// 	],
	// 	admissions: [
	// 		{ title: 'How to Apply', href: '#apply' },
	// 		{ title: 'Fees Structure', href: '#fees' },
	// 		{ title: 'Scholarships', href: '#scholarships' },
	// 	],
	// }

	return (
		<div className="lg:hidden">
			<button
				onClick={onToggle}
				className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
			>
				{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
					<div className="container mx-auto px-6 py-4">
						<Link
							href="/"
							className="block py-2 text-gray-700 hover:text-emerald-600"
						>
							Home
						</Link>
						{/* 
						{Object.entries(links).map(([section, items]) => (
							<div key={section} className="py-2">
								<button
									onClick={() =>
										setOpenSection(openSection === section ? null : section)
									}
									className="flex items-center justify-between w-full text-gray-700 hover:text-emerald-600"
								>
									<span className="capitalize">{section}</span>
									<ChevronDown
										className={`w-4 h-4 transition-transform ${
											openSection === section ? 'rotate-180' : ''
										}`}
									/>
								</button>

								{openSection === section && (
									<div className="pl-4 mt-2 space-y-2">
										{items.map(item => (
											<Link
												key={item.href}
												href={item.href}
												className="block py-2 text-gray-600 hover:text-emerald-600"
											>
												{item.title}
											</Link>
										))}
									</div>
								)}
							</div>
						))} */}

						<Link
							href="#contact"
							className="block py-2 text-gray-700 hover:text-emerald-600"
						>
							Contact
						</Link>
					</div>
				</div>
			)}
		</div>
	)
}
