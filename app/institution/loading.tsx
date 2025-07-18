export default function Loading() {
	return (
		// This div will only replace the content area, not the full page
		<div className="flex justify-center items-center h-full w-full p-6">
			{/* Simple spinner */}
			<div className="flex flex-col items-center gap-3">
				<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
				<p className="text-sm text-gray-500">Loading content...</p>
			</div>
		</div>
	)
}
