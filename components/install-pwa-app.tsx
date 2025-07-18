// components/install-pwa-button.tsx
'use client'

import { useState, useEffect } from 'react'
import { Download, Share, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPWAButtonProps {
	variant?:
		| 'default'
		| 'outline'
		| 'secondary'
		| 'destructive'
		| 'ghost'
		| 'link'
	size?: 'default' | 'sm' | 'lg' | 'icon'
	className?: string
	label?: string
}

export default function InstallPWAButton({
	variant = 'default',
	size = 'sm',
	className = '',
	label = 'App',
}: InstallPWAButtonProps) {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null)
	const [isIOS, setIsIOS] = useState(false)
	const [isAndroid, setIsAndroid] = useState(false)
	const [isInstalled, setIsInstalled] = useState(false)
	const [showIOSInstructions, setShowIOSInstructions] = useState(false)
	const [installAttempted, setInstallAttempted] = useState(false)

	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined') return

		// Check platform
		const isIOSDevice =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
		const isAndroidDevice = /Android/.test(navigator.userAgent)

		setIsIOS(isIOSDevice)
		setIsAndroid(isAndroidDevice)

		// Check if app is already installed
		const checkIfInstalled = () => {
			const isStandaloneMode =
				window.matchMedia('(display-mode: standalone)').matches ||
				('standalone' in navigator && (navigator as any).standalone === true)
			setIsInstalled(isStandaloneMode)
			return isStandaloneMode
		}

		if (checkIfInstalled()) {
			return
		}

		// Listen for display mode changes
		const mediaQuery = window.matchMedia('(display-mode: standalone)')
		mediaQuery.addEventListener('change', checkIfInstalled)

		// Listen for beforeinstallprompt event
		const handler = (e: Event) => {
			e.preventDefault()
			setDeferredPrompt(e as BeforeInstallPromptEvent)
		}

		window.addEventListener('beforeinstallprompt', handler)

		// Listen for app installed event
		window.addEventListener('appinstalled', () => {
			setIsInstalled(true)
			setDeferredPrompt(null)

			// Track install event if analytics is available
			if (typeof window !== 'undefined' && 'gtag' in window) {
				;(window as any).gtag('event', 'pwa_installed', {
					event_category: 'PWA',
					event_label: 'app_installed_successfully',
				})
			}
		})

		return () => {
			window.removeEventListener('beforeinstallprompt', handler)
			mediaQuery.removeEventListener('change', checkIfInstalled)
		}
	}, [])

	const handleInstallClick = async () => {
		setInstallAttempted(true)

		if (!deferredPrompt && isIOS) {
			// Show iOS installation instructions
			setShowIOSInstructions(true)
			return
		}

		if (!deferredPrompt) {
			// No installation prompt available
			// This happens on browsers that don't support installation
			// or if the app is already installed
			alert(
				"This browser doesn't support app installation or the app is already installed.",
			)
			return
		}

		// Show the installation prompt
		deferredPrompt.prompt()

		try {
			const { outcome } = await deferredPrompt.userChoice

			if (outcome === 'accepted') {
				setDeferredPrompt(null)

				// Track install accepted if analytics is available
				if (typeof window !== 'undefined' && 'gtag' in window) {
					;(window as any).gtag('event', 'pwa_install_accepted', {
						event_category: 'PWA',
						event_label: 'install_prompt_accepted',
					})
				}
			} else {
				// Track install dismissed if analytics is available
				if (typeof window !== 'undefined' && 'gtag' in window) {
					;(window as any).gtag('event', 'pwa_install_dismissed', {
						event_category: 'PWA',
						event_label: 'install_prompt_dismissed',
					})
				}
			}
		} catch (error) {
			console.error('Error during installation:', error)
		}
	}

	// Don't show button if already installed
	if (isInstalled) {
		return null
	}

	return (
		<>
			<div className="relative">
				<Button
					onClick={handleInstallClick}
					variant={variant}
					size={size}
					className={`gap-2 ${isAndroid ? 'relative' : ''} ${className}`}
				>
					<Download className="h-4 w-4" />
					{isAndroid ? `Android ${label}` : label}

					{isAndroid && (
						<Badge
							variant="secondary"
							className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground"
						>
							Android
						</Badge>
					)}
				</Button>
			</div>

			{/* iOS Installation Instructions Dialog */}
			<Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Install on iOS</DialogTitle>
						<DialogDescription>
							Follow these steps to install the app on your iOS device:
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
								<Share className="h-4 w-4 text-primary" />
							</div>
							<p className="text-sm">1. Tap the Share button in Safari</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
								<span className="text-primary text-xs font-bold">+</span>
							</div>
							<p className="text-sm">
								2. Scroll down and tap "Add to Home Screen"
							</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
								<Download className="h-4 w-4 text-primary" />
							</div>
							<p className="text-sm">3. Tap "Add" in the top right corner</p>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowIOSInstructions(false)}>
							Got it
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Optional: Installation Success Message */}
			<Dialog
				open={installAttempted && isInstalled}
				onOpenChange={() => setInstallAttempted(false)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Installation Successful!</DialogTitle>
						<DialogDescription>
							The app has been successfully installed on your device.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4 flex items-center justify-center">
						<div className="rounded-full bg-green-100 p-3">
							<Check className="h-6 w-6 text-green-600" />
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setInstallAttempted(false)}>Continue</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
