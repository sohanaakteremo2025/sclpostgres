import React from 'react'
import { ThemeToggle } from './theme-toggle'
import { UserButton } from './user-button'
import { MobileMenu } from './sidebar-mobile'
import { MenuGroup } from './types'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'

interface HeaderProps {
	title?: string
	breadcrumbItems?: BreadcrumbItem[]
	menuGroup: MenuGroup[]
	brand: { name: string; logo: string }
}

export function Header({
	title,
	breadcrumbItems,
	menuGroup,
	brand,
}: HeaderProps) {
	return (
		<header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-slate-800 bg-white dark:bg-slate-950">
			<div className="mx-4 sm:mx-8 flex h-14 items-center">
				<div className="flex items-center space-x-4 lg:space-x-0">
					<MobileMenu brand={brand} menuGroup={menuGroup} />

					{/* Either show breadcrumbs or title */}
					{breadcrumbItems ? (
						<Breadcrumb items={breadcrumbItems} />
					) : (
						<h1 className="font-bold">{title}</h1>
					)}
				</div>
				<div className="flex flex-1 items-center justify-end">
					<ThemeToggle />
					<UserButton />
				</div>
			</div>
		</header>
	)
}
