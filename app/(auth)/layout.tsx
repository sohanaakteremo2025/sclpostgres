import { Navbar } from '@/components/navbar'
import React from 'react'

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// Define dot patterns as CSS custom properties in a style block
	const purpleDotBg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='25' cy='25' r='2' fill='%236d28d9' /%3E%3C/svg%3E")`

	const pinkDotBg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='2' fill='%23db2777' /%3E%3C/svg%3E")`

	return (
		<main suppressHydrationWarning className="min-h-screen w-full">
			<Navbar />

			{/* Fixed background that doesn't scroll with content */}
			<div className="fixed inset-0 z-0">
				{/* Base gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-900/10 dark:to-purple-800/5" />

				{/* Dot pattern with data URIs */}
				<div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
					<div
						style={{
							backgroundImage: `${purpleDotBg}, ${pinkDotBg}`,
							backgroundSize: '100px 100px',
							height: '100%',
							width: '100%',
						}}
					></div>
				</div>
			</div>

			{/* Scrollable content area with proper padding */}
			<div className="relative z-10 min-h-screen flex flex-col">
				{/* Content area with scrolling - added py-20 to ensure spacing for navbar and footer */}
				<div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
					{children}
				</div>

				{/* Bottom Wave - no longer absolute, follows the content flow */}
				<div className="relative h-6 sm:h-10 lg:h-16 w-full overflow-hidden leading-none mt-auto">
					<svg
						className="relative block w-full h-full"
						viewBox="0 0 1200 120"
						preserveAspectRatio="none"
					>
						<path
							d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0H1200V92.83C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
							className="fill-purple-600/5"
						></path>
					</svg>
				</div>

				{/* Footer Note - no longer absolute, follows content flow */}
				<div className="relative w-full text-center text-zinc-400 dark:text-zinc-500 text-xs py-4">
					© {new Date().getFullYear()} VISION SOFTWARE. All rights reserved.
				</div>
			</div>
		</main>
	)
}
