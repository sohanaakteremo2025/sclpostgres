// hooks/use-pwa-install.ts
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallState {
	isInstallable: boolean
	isInstalled: boolean
	isIOS: boolean
	installPrompt: BeforeInstallPromptEvent | null
	showPrompt: boolean
	handleInstall: () => Promise<void>
	dismissPrompt: () => void
}

export function usePWAInstall(showDelay = 10000): PWAInstallState {
	const [installPrompt, setInstallPrompt] =
		useState<BeforeInstallPromptEvent | null>(null)
	const [showPrompt, setShowPrompt] = useState(false)
	const [isIOS, setIsIOS] = useState(false)
	const [isInstalled, setIsInstalled] = useState(false)

	useEffect(() => {
		// Check if running on iOS
		const isIOSDevice =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
		setIsIOS(isIOSDevice)

		// Check if app is already installed
		const checkStandalone = () => {
			const isStandaloneMode =
				window.matchMedia('(display-mode: standalone)').matches ||
				('standalone' in navigator && navigator['standalone'])
			setIsInstalled(isStandaloneMode as boolean)
			return isStandaloneMode
		}

		if (checkStandalone()) {
			return
		}

		// Listen for display mode changes
		const mediaQuery = window.matchMedia('(display-mode: standalone)')
		mediaQuery.addEventListener('change', checkStandalone)

		// Check if the prompt was recently dismissed
		const dismissedTime = localStorage.getItem('pwa-prompt-dismissed')
		if (dismissedTime) {
			const timeSinceDismissed = Date.now() - parseInt(dismissedTime)
			// Don't show if dismissed in the last 7 days
			if (timeSinceDismissed < 7 * 24 * 60 * 60 * 1000) {
				return
			}
		}

		const handler = (e: Event) => {
			e.preventDefault()
			setInstallPrompt(e as BeforeInstallPromptEvent)

			// Check engagement metrics before showing
			const checkEngagement = () => {
				const pageViews = parseInt(sessionStorage.getItem('pageViews') || '0')
				const timeSpent = parseInt(sessionStorage.getItem('timeSpent') || '0')

				// Show if user has viewed at least 3 pages or spent more than 30 seconds
				if (pageViews >= 3 || timeSpent > 30000) {
					setShowPrompt(true)
				}
			}

			// Show prompt after delay or based on engagement
			const showTimeout = setTimeout(() => {
				checkEngagement()
			}, showDelay)

			return () => clearTimeout(showTimeout)
		}

		window.addEventListener('beforeinstallprompt', handler)

		// For iOS devices, show the prompt after engagement
		if (isIOSDevice) {
			const showTimeout = setTimeout(() => {
				setShowPrompt(true)
			}, showDelay)

			return () => clearTimeout(showTimeout)
		}

		return () => {
			window.removeEventListener('beforeinstallprompt', handler)
			mediaQuery.removeEventListener('change', checkStandalone)
		}
	}, [showDelay])

	const handleInstall = async () => {
		if (!installPrompt) return

		installPrompt.prompt()
		const { outcome } = await installPrompt.userChoice

		if (outcome === 'accepted') {
			setInstallPrompt(null)
			setShowPrompt(false)
		}
	}

	const dismissPrompt = () => {
		setShowPrompt(false)
		localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
	}

	return {
		isInstallable: !!installPrompt || isIOS,
		isInstalled,
		isIOS,
		installPrompt,
		showPrompt,
		handleInstall,
		dismissPrompt,
	}
}
