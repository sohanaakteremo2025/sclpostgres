import React from 'react'

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// const session = await auth()
	// if (session) {
	// 	return redirect('/admin')
	// }
	return (
		<main suppressHydrationWarning className="min-h-screen w-full">
			{/* Fixed background that doesn't scroll with content */}
			<div className="fixed inset-0 z-0">
				{/* Professional gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/60 via-indigo-600/60 to-purple-700/60 dark:from-blue-700/60 dark:via-indigo-800/60 dark:to-purple-900/60" />

				{/* Subtle overlay for depth */}
				<div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent" />
			</div>

			{/* Scrollable content area with proper padding */}
			<div className="relative z-10 min-h-screen flex flex-col">
				{/* Content area with scrolling - added py-20 to ensure spacing for navbar and footer */}
				<div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
					{children}
				</div>
			</div>
		</main>
	)
}
