'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { MenuGroup } from '@/types/sidebar'

const RoutePrefetcher = ({ menuGroups }: { menuGroups: MenuGroup[] }) => {
	const pathname = usePathname()
	const router = useRouter()
	const prefetchedRoutes = useRef(new Set<string>())
	const prefetchTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({})

	// Clear any existing prefetch timeouts
	useEffect(() => {
		return () => {
			Object.values(prefetchTimeouts.current).forEach(timeout => {
				clearTimeout(timeout)
			})
		}
	}, [])

	const prefetchRoute = useCallback(
		(route: string) => {
			if (route !== pathname && !prefetchedRoutes.current.has(route)) {
				try {
					router.prefetch(route)
					prefetchedRoutes.current.add(route)
				} catch (error) {
					console.error(`Failed to prefetch route: ${route}`, error)
				}
			}
		},
		[pathname, router],
	)

	useEffect(() => {
		const prefetchRoutesInChunks = async () => {
			const allRoutes = menuGroups.flatMap(group =>
				group.menuItems.map(item => item.route),
			)

			// Prioritize routes based on current pathname
			const prioritizedRoutes = allRoutes.sort((a, b) => {
				// Current section routes get priority
				const currentSection = pathname.split('/')[3] // e.g., 'admin' from '/dashboard/admin/...'
				const aInSection = a.includes(currentSection)
				const bInSection = b.includes(currentSection)

				if (aInSection && !bInSection) return -1
				if (!aInSection && bInSection) return 1
				return 0
			})

			// Prefetch in chunks to avoid overwhelming the browser
			prioritizedRoutes.forEach((route, index) => {
				// Clear any existing timeout for this route
				if (prefetchTimeouts.current[route]) {
					clearTimeout(prefetchTimeouts.current[route])
				}

				// Set new timeout
				prefetchTimeouts.current[route] = setTimeout(() => {
					prefetchRoute(route)
				}, Math.min(index * 100, 2000)) // Max delay of 2 seconds
			})
		}

		prefetchRoutesInChunks()

		// Cleanup function
		return () => {
			Object.values(prefetchTimeouts.current).forEach(timeout => {
				clearTimeout(timeout)
			})
		}
	}, [menuGroups, prefetchRoute])

	// Periodically check and refresh prefetched routes
	useEffect(() => {
		const refreshInterval = setInterval(() => {
			prefetchedRoutes.current.clear() // Clear the set of prefetched routes
		}, 5 * 60 * 1000) // Every 5 minutes

		return () => clearInterval(refreshInterval)
	}, [])

	return null
}

export default RoutePrefetcher
