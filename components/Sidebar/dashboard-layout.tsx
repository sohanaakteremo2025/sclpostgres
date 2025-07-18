'use client'

import { Sidebar } from './sidebar-desktop'
import { useSidebar } from '@/hooks/use-sidebar'
import { useStore } from '@/hooks/use-store'
import { cn } from '@/lib/utils'
import { MenuGroup } from './types'
import { Header } from './Header'
import { usePathname } from 'next/navigation'
import { BreadcrumbItem } from './Breadcrumb'

interface Brand {
	name: string
	logo: string
}

export default function DashboardLayout({
	menuGroup,
	children,
	brand,
}: {
	menuGroup: MenuGroup[]
	brand: Brand
	children: React.ReactNode
}) {
	const sidebar = useStore(useSidebar, x => x)
	const pathname = usePathname()

	if (!sidebar) return null
	const { getOpenState, settings } = sidebar

	// Generate breadcrumbs based on current pathname and menu structure
	const breadcrumbItems = generateBreadcrumbs(pathname, menuGroup)

	return (
		<>
			<Sidebar brand={brand} menuGroup={menuGroup} />
			<main
				className={cn(
					'min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300',
					!settings.disabled && (!getOpenState() ? 'lg:ml-[90px]' : 'lg:ml-72'),
				)}
			>
				<Header
					brand={brand}
					breadcrumbItems={breadcrumbItems}
					menuGroup={menuGroup}
				/>
				<div className="max-w-screen-2xl mx-auto py-8 px-4 sm:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh_-_56px)]">
					{children}
				</div>
			</main>
		</>
	)
}

/**
 * Generate breadcrumb items based on current path and menu structure
 */
function generateBreadcrumbs(
	pathname: string,
	menuGroups: MenuGroup[],
): BreadcrumbItem[] {
	// Get path segments (excluding empty segments)
	const segments = pathname.split('/').filter(Boolean)

	// Initialize breadcrumbs
	const breadcrumbs: BreadcrumbItem[] = []

	// Build full path segments
	const pathSegments: string[] = []
	segments.forEach((segment, index) => {
		// Build the path up to this segment
		if (index === 0) {
			pathSegments.push(`/${segment}`)
		} else {
			pathSegments.push(`${pathSegments[index - 1]}/${segment}`)
		}
	})

	// Create a map for quick look-up of menu items by href
	const menuMap = new Map<
		string,
		{ label: string; icon: string; group: string }
	>()
	menuGroups.forEach(group => {
		group.menus.forEach(menu => {
			menuMap.set(menu.href, {
				label: menu.label,
				icon: menu.icon,
				group: group.groupLabel,
			})
		})
	})

	// For dashboard root
	if (segments.length === 1 && segments[0] === 'admin') {
		return [
			{
				label: 'Dashboard',
				href: '/admin',
				isCurrent: true,
			},
		]
	}

	// Always add Dashboard as first breadcrumb, if not already on dashboard
	breadcrumbs.push({
		label: 'Dashboard',
		href: '/admin',
		isCurrent: false,
	})

	// Process each path segment
	pathSegments.forEach((path, index) => {
		// Skip the first segment if it's just "/admin", as we added it manually
		if (path === '/admin' && index === 0) return

		const menuItem = menuMap.get(path)

		if (menuItem) {
			// This is a known menu item
			breadcrumbs.push({
				label: menuItem.label,
				href: path,
				isCurrent: index === pathSegments.length - 1,
			})
		} else if (index === pathSegments.length - 1) {
			// This is the last segment but unknown in menu - create a formatted breadcrumb
			const lastSegment = segments[index]
			const label = lastSegment
				.replace(/-/g, ' ')
				.replace(/\b\w/g, char => char.toUpperCase())

			breadcrumbs.push({
				label,
				href: path,
				isCurrent: true,
			})
		}
	})

	return breadcrumbs
}
