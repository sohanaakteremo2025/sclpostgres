'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const backgroundImages = [
	'/company/slides/slide1.jpg',
	'/company/slides/slide2.jpg',
	'/company/slides/slide4.jpg',
	'/company/slides/slide5.jpg',
	'/company/slides/slide6.jpg',
	'/company/slides/slide7.jpg',
	'/company/slides/slide8.jpg',
]

export default function Hero() {
	const [currentBg, setCurrentBg] = useState(0)
	const [nextBg, setNextBg] = useState(1)

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentBg(nextBg)
			setNextBg(prevBg => (prevBg + 1) % backgroundImages.length)
		}, 5000) // Change background every 5 seconds

		return () => clearInterval(intervalId)
	}, [nextBg])

	return (
		<section className="relative h-screen overflow-hidden">
			{backgroundImages.map((img, index) => (
				<div
					key={img}
					className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
						index === currentBg ? 'opacity-100' : 'opacity-0'
					}`}
					style={{ backgroundImage: `url(${img})` }}
				/>
			))}
			<div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/60 opacity-100" />
			<div className="relative max-w-7xl mx-auto px-4 h-full flex items-center text-white">
				<div className="max-w-3xl">
					<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-6">
						Streamline Your Educational Institution Management
					</h1>
					<p className="text-lg sm:text-xl mb-8 max-w-2xl">
						One platform for schools, colleges, and universities to manage
						everything from admissions to alumni relations.
					</p>
					<Link href="#cta" className="flex flex-col sm:flex-row gap-4">
						<Button
							size="lg"
							className="bg-white text-blue-600 hover:bg-gray-100"
						>
							Start Free Trial
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="bg-transparent text-white border-white hover:bg-white/20"
						>
							Learn More
						</Button>
					</Link>
				</div>
			</div>
		</section>
	)
}
