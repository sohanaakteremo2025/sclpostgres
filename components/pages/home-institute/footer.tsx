import React from 'react'

export async function Footer({ data }: { data: any }) {
	return (
		<footer className="bg-emerald-950 text-emerald-200 py-8">
			<div className="container mx-auto px-6 text-center">
				<p>
					© {new Date().getFullYear()} {data?.name}. All rights reserved.
				</p>
			</div>
		</footer>
	)
}
