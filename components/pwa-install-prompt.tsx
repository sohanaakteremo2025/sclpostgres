'use client'

import { X, Download, Share, CheckCircle2 } from 'lucide-react'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface AdvancedPWAPromptProps {
	appName?: string
	appIcon?: string
	features?: string[]
	showDelay?: number
}

export default function AdvancedPWAPrompt({
	appName = 'School',
	appIcon = '/192x192.png',
	features = [
		'Works offline',
		'Faster loading',
		'Push notifications',
		'Native app experience',
	],
	showDelay = 10000,
}: AdvancedPWAPromptProps) {
	const { isInstalled, isIOS, showPrompt, handleInstall, dismissPrompt } =
		usePWAInstall(showDelay)

	if (!showPrompt || isInstalled) return null

	// iOS installation instructions
	if (isIOS) {
		return (
			<div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300 sm:left-auto sm:right-8 sm:w-[420px]">
				<Card className="shadow-lg">
					<CardHeader className="relative pb-3">
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-2 top-2 h-8 w-8"
							onClick={dismissPrompt}
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</Button>
						<div className="flex items-center gap-3">
							<img
								src={appIcon}
								alt={`${appName} icon`}
								className="h-12 w-12 rounded-lg shadow-sm"
							/>
							<div>
								<CardTitle className="text-lg">Install {appName}</CardTitle>
								<CardDescription>Add to your home screen</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Alert className="bg-secondary/50">
							<Share className="h-4 w-4" />
							<AlertDescription>
								To install on iOS:
								<ol className="mt-2 list-decimal pl-4 space-y-1 text-sm">
									<li>
										Tap the share button{' '}
										<Share className="inline h-3.5 w-3.5" />
									</li>
									<li>Scroll and tap "Add to Home Screen"</li>
									<li>Tap "Add" to confirm</li>
								</ol>
							</AlertDescription>
						</Alert>
					</CardContent>
					<CardFooter>
						<Button
							variant="secondary"
							className="w-full"
							onClick={dismissPrompt}
						>
							Got it
						</Button>
					</CardFooter>
				</Card>
			</div>
		)
	}

	// Default installation prompt
	return (
		<div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300 sm:left-auto sm:right-8 sm:w-[420px]">
			<Card className="shadow-lg">
				<CardHeader className="relative pb-3">
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-2 top-2 h-8 w-8"
						onClick={dismissPrompt}
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</Button>
					<div className="flex items-center gap-3">
						<img
							src={appIcon}
							alt={`${appName} icon`}
							className="h-12 w-12 rounded-lg shadow-sm"
						/>
						<div>
							<CardTitle className="text-lg">Install {appName}</CardTitle>
							<CardDescription>Get the full experience</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="space-y-2">
							<Badge variant="secondary" className="mb-2">
								<CheckCircle2 className="mr-1 h-3 w-3" />
								Benefits
							</Badge>
							<ul className="grid grid-cols-2 gap-2">
								{features.map((feature, index) => (
									<li key={index} className="flex items-center gap-2 text-sm">
										<div className="h-1.5 w-1.5 rounded-full bg-primary" />
										{feature}
									</li>
								))}
							</ul>
						</div>
					</div>
				</CardContent>
				<CardFooter className="gap-2">
					<Button variant="outline" className="w-full" onClick={dismissPrompt}>
						Maybe later
					</Button>
					<Button className="w-full" onClick={handleInstall}>
						<Download className="mr-2 h-4 w-4" />
						Install now
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
