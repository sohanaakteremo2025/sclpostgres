'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { UserAvatar } from '@/components/user-avatar'

const testimonials = [
	{
		quote:
			"Vision Software has revolutionized how we handle student data and course management. It's a game-changer for our institution.",
		author: 'Mr. Mohammad Sikanadar',
		role: 'Vice Principal, Laboratory School',
		avatar: '/placeholder.svg?height=80&width=80',
	},
	{
		quote:
			'The analytics feature has provided invaluable insights, helping us make data-driven decisions to improve student outcomes.',
		author: 'Mr. Habib Ullah',
		role: 'Principal, Kajem Ali College',
		avatar: '/placeholder.svg?height=80&width=80',
	},
	{
		quote:
			"Vision Software's user-friendly interface has significantly reduced the learning curve for our staff. It's intuitive and powerful.",
		author: 'Ms. Sarah Rahman',
		role: 'Principal, Arts College',
		avatar: '/placeholder.svg?height=80&width=80',
	},
	{
		quote:
			"The customer support team is exceptional. They've been incredibly responsive and helpful throughout our implementation.",
		author: 'Mr. Hafizul Islam',
		role: 'Principal, Model High School',
		avatar: '/placeholder.svg?height=80&width=80',
	},
]

export default function Testimonials() {
	const [currentIndex, setCurrentIndex] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length)
		}, 5000) // Change testimonial every 5 seconds

		return () => clearInterval(timer)
	}, [])

	const nextTestimonial = () => {
		setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length)
	}

	const prevTestimonial = () => {
		setCurrentIndex(
			prevIndex => (prevIndex - 1 + testimonials.length) % testimonials.length,
		)
	}

	return (
		<section id="testimonials" className="py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				<h2 className="text-3xl font-bold text-center mb-12">
					What Our Clients Say
				</h2>
				<div className="relative max-w-4xl mx-auto">
					<div className="overflow-hidden py-4">
						<div
							className="flex transition-transform duration-500 ease-in-out"
							style={{ transform: `translateX(-${currentIndex * 100}%)` }}
						>
							{testimonials.map((testimonial, index) => (
								<div key={index} className="w-full flex-shrink-0 px-4">
									<div className="bg-white p-6 rounded-lg shadow-md">
										<p className="text-gray-600 mb-4 text-lg italic">
											"{testimonial.quote}"
										</p>
										<div className="flex gap-2 items-center">
											{/* <Image
												src={testimonial.avatar}
												alt={testimonial.author}
												width={60}
												height={60}
												className="rounded-full mr-4"
											/> */}
											<UserAvatar firstName={testimonial.author} />
											<div>
												<p className="font-semibold">{testimonial.author}</p>
												<p className="text-sm text-gray-500">
													{testimonial.role}
												</p>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
					<button
						onClick={prevTestimonial}
						className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
						aria-label="Previous testimonial"
					>
						<ChevronLeft className="w-6 h-6 text-gray-600" />
					</button>
					<button
						onClick={nextTestimonial}
						className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
						aria-label="Next testimonial"
					>
						<ChevronRight className="w-6 h-6 text-gray-600" />
					</button>
				</div>
			</div>
		</section>
	)
}
