import React from 'react'
import Link from 'next/link'

const links = {
	about: [
		{ title: 'Our History', href: '#history' },
		{ title: 'Mission & Vision', href: '#mission' },
		{ title: 'Leadership', href: '#leadership' },
	],
	academics: [
		{ title: 'Primary School', href: '#primary' },
		{ title: 'Secondary School', href: '#secondary' },
		{ title: 'Curriculum', href: '#curriculum' },
	],
	admissions: [
		{ title: 'How to Apply', href: '#apply' },
		{ title: 'Fees Structure', href: '#fees' },
		{ title: 'Scholarships', href: '#scholarships' },
	],
}

interface DropdownProps {
	items: { title: string; href: string }[]
	isOpen: boolean
}

const Dropdown: React.FC<DropdownProps> = ({ items, isOpen }) => (
	<div
		className={`absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white rounded-lg shadow-lg py-2 transition-all duration-200 ${
			isOpen
				? 'opacity-100 visible translate-y-0'
				: 'opacity-0 invisible -translate-y-2'
		}`}
	>
		{items.map(item => (
			<Link
				key={item.href}
				href={item.href}
				className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
			>
				{item.title}
			</Link>
		))}
	</div>
)

export function NavLinks() {
	const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

	return (
		<div className="flex items-center justify-center space-x-2">
			<Link href="/" className="hover:text-emerald-600 px-4 py-2">
				Home
			</Link>
			{/* {Object.entries(links).map(([key, items]) => (
				<div
					key={key}
					className="relative group"
					onMouseEnter={() => setOpenDropdown(key)}
					onMouseLeave={() => setOpenDropdown(null)}
				>
					<button className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 px-4 py-2">
						<span className="capitalize">{key}</span>
						<ChevronDown className="w-4 h-4" />
					</button>
					<Dropdown items={items} isOpen={openDropdown === key} />
				</div>
			))} */}
			<Link href="#contact" className=" hover:text-emerald-600 px-4 py-2">
				Contact
			</Link>
		</div>
	)
}
