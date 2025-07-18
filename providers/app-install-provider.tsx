// providers/engagement-provider.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { EngagementTracker } from '@/utils/app-install-tracker'

export function EngagementProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const tracker = EngagementTracker.getInstance()

	useEffect(() => {
		// Track page view
		tracker.trackPageView()
	}, [pathname])

	useEffect(() => {
		// Track time spent
		const interval = setInterval(() => {
			tracker.updateTimeSpent()
		}, 5000) // Update every 5 seconds

		// Track interactions
		const handleInteraction = () => {
			tracker.trackInteraction()
		}

		window.addEventListener('click', handleInteraction)
		window.addEventListener('scroll', handleInteraction, { passive: true })

		return () => {
			clearInterval(interval)
			window.removeEventListener('click', handleInteraction)
			window.removeEventListener('scroll', handleInteraction)
		}
	}, [])

	return <>{children}</>
}
