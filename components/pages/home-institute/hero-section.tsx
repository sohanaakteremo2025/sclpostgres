'use client'

import { useState, useEffect, useMemo } from 'react'

const defaultBackgroundImages = [
	'/company/slides/slide2.jpg',
	'/company/slides/slide1.jpg',
	'/company/slides/slide4.jpg',
	'/company/slides/slide5.jpg',
	'/company/slides/slide6.jpg',
	'/company/slides/slide7.jpg',
	'/company/slides/slide8.jpg',
]

// Separate background component to prevent unnecessary re-renders
const BackgroundImage = ({
	src,
	isActive,
}: {
	src: string
	isActive: boolean
}) => (
	<div
		className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
			isActive ? 'opacity-100' : 'opacity-0'
		}`}
		style={{ backgroundImage: `url(${src})` }}
	/>
)

export function Hero({ data }: { data: any }) {
	const [currentBg, setCurrentBg] = useState(0)
	// Memoize the gallery to prevent unnecessary re-renders
	const images = useMemo(() => {
		return data?.gallery?.length ? data.gallery : defaultBackgroundImages
	}, [data?.gallery])

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentBg(prev => (prev + 1) % images.length)
		}, 5000)

		return () => clearInterval(intervalId)
	}, [images.length])

	return (
		<section className="relative h-screen overflow-hidden">
			{images.map((img: string, index: number) => (
				<BackgroundImage key={img} src={img} isActive={index === currentBg} />
			))}

			<div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/60" />

			<div className="relative max-w-7xl mx-auto px-4 h-full flex items-center text-white">
				<div className="max-w-3xl">
					<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-6 capitalize">
						Welcome to <span className="italic">{data?.name}</span>
					</h1>
					<p className="text-lg sm:text-xl mb-8 max-w-2xl">
						Take the first step towards a brighter future with us. Explore our
						programs, meet our passionate educators, and discover how we can
						help your child achieve greatness. Together, let's shape the leaders
						of tomorrow.
					</p>
				</div>
			</div>
		</section>
	)
}

export default Hero
