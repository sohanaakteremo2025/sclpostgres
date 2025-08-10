'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import {
	BookOpen,
	Users,
	Shield,
	Award,
	GraduationCap,
	Microscope,
	Calculator,
	Palette,
	Globe,
	Heart,
	Phone,
	Mail,
	MapPin,
	MessageCircle,
	Star,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Clock,
	Bell,
	CheckCircle,
	LogIn,
	Target,
	ArrowRight,
	Menu,
	X,
} from 'lucide-react'

// Types for your database models
interface Tenant {
	id: string
	logo: string
	name: string
	email: string
	phone: string
	address: string
	domain: string
	status: 'ACTIVE' | 'INACTIVE'
	createdAt: Date
	updatedAt: Date
	messages?: TenantMessage[]
	notices?: Notice[]
}

interface TenantMessage {
	id: string
	author: string
	title: string
	message: string
	photo?: string
	createdAt: Date
	updatedAt: Date
	tenantId: string
}

interface Notice {
	id: string
	title: string
	content: string
	createdAt: Date
	updatedAt: Date
	tenantId: string
}

interface HomePageProps {
	tenant: Tenant
}

// Modern Navigation Component
function ModernNavigation({ tenant }: { tenant: Tenant }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo and School Name */}
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center p-1">
							<Image
								src={tenant.logo}
								alt="School Logo"
								width={32}
								height={32}
								className="rounded-md object-cover"
							/>
						</div>
						<div>
							<h1 className="text-lg font-semibold text-gray-900">
								{tenant.name}
							</h1>
							<p className="text-xs text-gray-500">Excellence in Education</p>
						</div>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						<a
							href="#about"
							className="text-gray-600 hover:text-primary transition-colors font-medium"
						>
							About
						</a>
						<a
							href="#programs"
							className="text-gray-600 hover:text-primary transition-colors font-medium"
						>
							Programs
						</a>
						<a
							href="#notices"
							className="text-gray-600 hover:text-primary transition-colors font-medium"
						>
							News
						</a>
						<a
							href="#contact"
							className="text-gray-600 hover:text-primary transition-colors font-medium"
						>
							Contact
						</a>
					</div>

					{/* Contact Info and Login */}
					<div className="hidden md:flex items-center space-x-4">
						<div className="flex items-center space-x-2 text-sm text-gray-600">
							<Phone className="h-4 w-4" />
							<span>{tenant.phone}</span>
						</div>
						<Link href="/login">
							<Button className="bg-primary hover:bg-primary/90 text-white">
								<LogIn className="mr-2 h-4 w-4" />
								Login
							</Button>
						</Link>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="text-gray-600 hover:text-primary"
						>
							{isMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-gray-100">
						<div className="flex flex-col space-y-3">
							<a
								href="#about"
								className="text-gray-600 hover:text-primary transition-colors font-medium py-2"
							>
								About
							</a>
							<a
								href="#programs"
								className="text-gray-600 hover:text-primary transition-colors font-medium py-2"
							>
								Programs
							</a>
							<a
								href="#notices"
								className="text-gray-600 hover:text-primary transition-colors font-medium py-2"
							>
								News
							</a>
							<a
								href="#contact"
								className="text-gray-600 hover:text-primary transition-colors font-medium py-2"
							>
								Contact
							</a>
							<div className="pt-3 border-t border-gray-100">
								<div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
									<Phone className="h-4 w-4" />
									<span>{tenant.phone}</span>
								</div>
								<Link href="/login">
									<Button className="bg-primary hover:bg-primary/90 text-white w-full">
										<LogIn className="mr-2 h-4 w-4" />
										Login
									</Button>
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	)
}

function HeroCarousel({ tenant }: { tenant: Tenant }) {
	const [currentSlide, setCurrentSlide] = useState(0)

	const slides = [
		{
			image: '/campus.jpg',
			title: 'Shaping the Future of Education',
			subtitle:
				'Empowering every student with quality learning and moral values',
			badge: 'Future Education',
		},
		{
			image: '/classroom.jpg',
			title: 'Excellence in Learning',
			subtitle:
				'Modern teaching methods combined with traditional values for holistic development',
			badge: 'Academic Excellence',
		},
		{
			image: '/lab.jpg',
			title: 'Innovation & Discovery',
			subtitle:
				'State-of-the-art facilities fostering scientific thinking and practical learning',
			badge: 'Innovation Hub',
		},
		{
			image: '/sports.jpg',
			title: 'Building Character',
			subtitle:
				'Sports and extracurricular activities for physical and mental development',
			badge: 'Character Building',
		},
	]

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide(prev => (prev + 1) % slides.length)
		}, 5000)
		return () => clearInterval(timer)
	}, [slides.length])

	const nextSlide = () => {
		setCurrentSlide(prev => (prev + 1) % slides.length)
	}

	const prevSlide = () => {
		setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
	}

	return (
		<div className="relative md:h-[calc(100vh-4rem)] h-96 overflow-hidden">
			{/* Carousel Images */}
			<div className="relative w-full h-full">
				{slides.map((slide, index) => (
					<div
						key={index}
						className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
							index === currentSlide
								? 'translate-x-0'
								: index < currentSlide
									? '-translate-x-full'
									: 'translate-x-full'
						}`}
					>
						<div className="relative w-full h-full">
							<Image
								src={slide.image}
								alt={slide.title}
								fill
								className="object-cover"
								priority={index === 0}
							/>
							{/* Enhanced Gradient Overlays for Better Text Contrast */}
							<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
							<div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/20"></div>

							{/* Content Overlay */}
							<div className="absolute inset-0 flex items-center">
								<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
									<div className="max-w-4xl">
										<div className="space-y-6 text-white relative">
											<div className="relative z-10">
												<Badge className="bg-white/25 text-white border-white/40 backdrop-blur-md shadow-lg mb-6">
													{slide.badge}
												</Badge>
												<h1 className="text-4xl lg:text-7xl font-bold leading-tight drop-shadow-2xl mb-6">
													{tenant.name}
												</h1>
												<p className="text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-2xl drop-shadow-lg mb-8">
													{slide.subtitle}
												</p>
												<div className="flex flex-col sm:flex-row gap-4 pt-4">
													<Button
														size="lg"
														className="bg-primary/90 hover:bg-primary text-white px-8 py-3 backdrop-blur-sm shadow-xl border border-white/20"
													>
														Apply for Admission
													</Button>
													<Button
														size="lg"
														variant="outline"
														className="bg-white/25 border-white/60 text-white hover:bg-white/20 px-8 py-3 backdrop-blur-sm shadow-xl"
													>
														Learn More About Us
													</Button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Navigation Arrows */}
			<button
				onClick={prevSlide}
				className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-all duration-300 z-10 border border-white/20 shadow-xl"
			>
				<ChevronLeft className="w-6 h-6" />
			</button>
			<button
				onClick={nextSlide}
				className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-all duration-300 z-10 border border-white/20 shadow-xl"
			>
				<ChevronRight className="w-6 h-6" />
			</button>

			{/* Dots Indicator */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentSlide(index)}
						className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/30 ${
							index === currentSlide
								? 'bg-white scale-125 shadow-lg'
								: 'bg-white/60 hover:bg-white/80 shadow-md'
						}`}
					/>
				))}
			</div>
		</div>
	)
}

// Google Maps Component
function GoogleMap({ address }: { address: string }) {
	const encodedAddress = encodeURIComponent(address)
	const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`

	return (
		<div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
			<iframe
				src={mapSrc}
				width="100%"
				height="100%"
				style={{ border: 0 }}
				allowFullScreen
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
				className="w-full h-full"
				title="Institution Location"
			></iframe>
		</div>
	)
}

// User Avatar Component
function UserAvatar({
	firstName,
	lastName,
}: {
	firstName: string
	lastName: string
}) {
	const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

	return (
		<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
			<span className="text-primary font-semibold text-sm">{initials}</span>
		</div>
	)
}

export default function EducationLandingPage({ tenant }: HomePageProps) {
	const schoolData = tenant

	return (
		<div className="min-h-screen bg-white">
			{/* Modern Navigation */}
			<ModernNavigation tenant={schoolData} />

			{/* Hero Section */}
			<section className="relative bg-gradient-to-br from-gray-50 via-gray-50 to-white">
				<HeroCarousel tenant={schoolData} />
			</section>

			{/* Announcement Bar */}
			<section className="bg-gradient-to-r from-primary to-primary/90 py-4 shadow-lg">
				<div className="max-w-7xl mx-auto px-4">
					<div className="flex items-center justify-center gap-3 text-center">
						<Bell className="h-5 w-5 text-white animate-bounce" />
						<p className="text-white font-medium text-lg">
							Admissions Open for {new Date().getFullYear()}-
							{new Date().getFullYear() + 1} Academic Year!
							<Link
								href="#admission"
								className="underline font-bold ml-2 hover:text-primary-foreground transition-colors"
							>
								Apply Now
							</Link>
						</p>
					</div>
				</div>
			</section>

			{/* About Section */}
			<section id="about" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
							About <span className="text-primary">{schoolData.name}</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							We are committed to providing quality education that combines
							academic excellence with character development, preparing students
							for a bright future.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 mb-16">
						<Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-2">
							<CardHeader className="text-center pb-4">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<Users className="w-8 h-8 text-primary" />
								</div>
								<CardTitle className="text-xl text-gray-900">
									Expert Faculty
								</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<p className="text-gray-600">
									Learn from experienced and dedicated teachers who are
									committed to your success and growth.
								</p>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-2">
							<CardHeader className="text-center pb-4">
								<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Shield className="w-8 h-8 text-orange-600" />
								</div>
								<CardTitle className="text-xl text-gray-900">
									Safe Environment
								</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<p className="text-gray-600">
									A secure and clean environment where students can learn and
									grow with confidence.
								</p>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-2">
							<CardHeader className="text-center pb-4">
								<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Heart className="w-8 h-8 text-red-600" />
								</div>
								<CardTitle className="text-xl text-gray-900">
									Holistic Education
								</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<p className="text-gray-600">
									Combining modern education with traditional values for
									complete character development.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Programs Section */}
			<section id="programs" className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							<span className="text-primary">Our</span> Programs
						</h2>
						<p className="text-xl text-gray-600">
							Comprehensive educational programs designed to nurture every
							aspect of student development
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{
								icon: <BookOpen className="w-8 h-8" />,
								title: 'Primary Education',
								description:
									'Foundation years focused on basic literacy, numeracy, and social skills',
								color: 'bg-blue-100 text-blue-600',
							},
							{
								icon: <Calculator className="w-8 h-8" />,
								title: 'Secondary Education',
								description:
									'Advanced curriculum preparing students for higher education',
								color: 'bg-primary/10 text-primary',
							},
							{
								icon: <Microscope className="w-8 h-8" />,
								title: 'Science & Technology',
								description:
									'Hands-on learning in modern laboratories and computer labs',
								color: 'bg-purple-100 text-purple-600',
							},
							{
								icon: <Palette className="w-8 h-8" />,
								title: 'Arts & Culture',
								description:
									'Creative expression through music, art, and cultural activities',
								color: 'bg-pink-100 text-pink-600',
							},
						].map((program, index) => (
							<Card
								key={index}
								className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
							>
								<CardHeader className="text-center">
									<div
										className={`w-16 h-16 ${program.color} rounded-full flex items-center justify-center mx-auto mb-4`}
									>
										{program.icon}
									</div>
									<CardTitle className="text-lg">{program.title}</CardTitle>
								</CardHeader>
								<CardContent className="text-center">
									<p className="text-gray-600 text-sm">{program.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Faculty Messages Section */}
			{schoolData.messages && schoolData.messages.length > 0 && (
				<section className="py-20 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl lg:text-4xl font-bold mb-4">
								<span className="text-primary">Message from</span> Leadership
							</h2>
							<p className="text-xl text-gray-600">
								Our dedicated educators are committed to providing quality
								education and nurturing young minds.
							</p>
						</div>

						<div className="flex flex-col gap-12">
							{schoolData.messages.map((message, index) => (
								<div
									key={message.id}
									className={`flex flex-col lg:flex-row gap-8 items-center ${
										index % 2 === 1 ? 'lg:flex-row-reverse' : ''
									}`}
								>
									<div className="w-full lg:w-1/2">
										<div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
											<div className="aspect-square lg:aspect-[4/3] relative">
												<Image
													src={message.photo || '/placeholder.svg'}
													alt={message.author}
													fill
													className="object-cover"
												/>
											</div>
										</div>
									</div>
									<div className="w-full lg:w-1/2">
										<div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl shadow-lg border border-primary/20">
											<div className="flex items-center gap-3 mb-4">
												<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
													<GraduationCap className="w-6 h-6 text-primary" />
												</div>
												<div>
													<h3 className="text-2xl font-bold text-primary">
														{message.author}
													</h3>
													<p className="text-orange-600 font-medium">
														{message.title}
													</p>
												</div>
											</div>
											<div
												dangerouslySetInnerHTML={{ __html: message.message }}
												className="text-gray-600 leading-relaxed text-base"
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Notice Board Section */}
			{schoolData.notices && schoolData.notices.length > 0 && (
				<section id="notices" className="py-20 bg-gray-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl lg:text-4xl font-bold mb-4">
								<span className="text-primary">Latest News &</span> Updates
							</h2>
							<p className="text-xl text-gray-600">
								Stay informed about the latest happenings and updates at{' '}
								{schoolData.name}.
							</p>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{schoolData.notices.slice(0, 6).map((notice, index) => (
								<Card
									key={notice.id}
									className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
								>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between mb-3">
											<Badge className="bg-primary/10 text-primary">News</Badge>
											<span className="text-sm text-gray-500">
												{format(new Date(notice.createdAt), 'dd/MM/yyyy')}
											</span>
										</div>
										<CardTitle className="text-lg line-clamp-2">
											{notice.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
											{notice.content}
										</p>
										<Link
											href="#"
											className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
										>
											Read More
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</CardContent>
								</Card>
							))}
						</div>

						{schoolData.notices.length > 6 && (
							<div className="text-center mt-12">
								<Button
									variant="outline"
									className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8 py-3"
								>
									View All News
								</Button>
							</div>
						)}
					</div>
				</section>
			)}

			{/* Campus Facilities */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							<span className="text-primary">Campus</span> Facilities
						</h2>
						<p className="text-xl text-gray-600">
							We provide state-of-the-art facilities to ensure an excellent
							learning environment for our students.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								image: '/library.jpg',
								title: 'Modern Library',
								description:
									'Our library features 10,000+ books, digital resources, and quiet study spaces.',
								features: [
									'10,000+ Books',
									'Digital Resources',
									'Quiet Environment',
									'Extended Hours',
								],
							},
							{
								image: '/lab.jpg',
								title: 'Computer Lab',
								description:
									'Equipped with latest technology supporting digital education and computer science learning.',
								features: [
									'50+ Computers',
									'High-Speed Internet',
									'Modern Software',
									'Trained Instructors',
								],
							},
							{
								image: '/classroom.jpg',
								title: 'Smart Classrooms',
								description:
									'Interactive whiteboards and multimedia equipment for enhanced learning experience.',
								features: [
									'Smart Boards',
									'Projectors',
									'Air Conditioned',
									'Comfortable Seating',
								],
							},
						].map((facility, index) => (
							<div
								key={index}
								className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
							>
								<div className="aspect-[4/3] overflow-hidden">
									<Image
										src={facility.image}
										alt={facility.title}
										width={400}
										height={300}
										className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
									/>
								</div>
								<div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
									<h3 className="text-xl font-bold text-white mb-3">
										{facility.title}
									</h3>
									<p className="text-white/90 mb-4 text-sm leading-relaxed">
										{facility.description}
									</p>
									<div className="space-y-1">
										{facility.features.map((feature, idx) => (
											<div
												key={idx}
												className="flex items-center gap-2 text-white/80 text-xs"
											>
												<CheckCircle className="w-3 h-3 text-white" />
												<span>{feature}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							<span className="text-primary">What Parents &</span> Students Say
						</h2>
						<p className="text-xl text-gray-600">
							Hear from our community about their experience
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								name: 'Sarah Ahmed',
								role: 'Parent',
								rating: 5,
								quote: `The teachers at ${schoolData.name} are incredibly dedicated and caring. My daughter has shown remarkable improvement in both academics and character development.`,
							},
							{
								name: 'Michael Johnson',
								role: '12th Grade Student',
								rating: 5,
								quote:
									'This institution provides an excellent blend of modern education and traditional values. I am proud to be a student here.',
							},
							{
								name: 'Lisa Chen',
								role: 'Parent',
								rating: 5,
								quote:
									'The safe and nurturing environment has helped my son become a confident and responsible young man. Highly recommended!',
							},
						].map((testimonial, index) => (
							<Card
								key={index}
								className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
							>
								<CardContent className="p-6">
									<div className="flex items-center mb-4">
										{[...Array(testimonial.rating)].map((_, i) => (
											<Star
												key={i}
												className="w-5 h-5 text-yellow-400 fill-current"
											/>
										))}
									</div>
									<p className="text-gray-600 mb-4 italic leading-relaxed">
										"{testimonial.quote}"
									</p>
									<div className="flex items-center">
										<UserAvatar
											firstName={testimonial.name.split(' ')[0]}
											lastName={testimonial.name.split(' ')[1] || 'U'}
										/>
										<div className="ml-3">
											<p className="font-semibold text-gray-900">
												{testimonial.name}
											</p>
											<p className="text-sm text-gray-600">
												{testimonial.role}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-br from-primary to-primary/90 relative overflow-hidden">
				<div className="absolute inset-0 z-0">
					<Image
						src="/campus.jpg"
						alt="Campus"
						fill
						className="object-cover mix-blend-overlay opacity-20"
					/>
				</div>
				<div className="absolute inset-0 z-0">
					<div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
					<div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse delay-1000"></div>
				</div>

				<div className="max-w-7xl mx-auto px-4 relative z-10">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
							Ready to Join {schoolData.name}?
						</h2>
						<p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
							Take the first step towards a bright future. Apply for the
							upcoming academic year and become part of our vibrant educational
							community.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
							<Button
								size="lg"
								className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
							>
								<Calendar className="mr-2 h-5 w-5" />
								Schedule a Visit
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="bg-white/10 border-2 hover:bg-white/20 px-8 py-4 text-lg rounded-xl text-white border-white/60 backdrop-blur-sm"
							>
								<Phone className="mr-2 h-5 w-5" />
								Contact Us Now
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section id="contact" className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							<span className="text-primary">Contact &</span> Location
						</h2>
						<p className="text-xl text-gray-600">
							Get in touch with us for admissions and inquiries
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12">
						<div className="space-y-8">
							<div className="bg-white rounded-xl shadow-lg p-8">
								<h3 className="text-2xl font-bold text-gray-900 mb-6">
									Contact Information
								</h3>
								<div className="space-y-4">
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
											<Phone className="w-6 h-6 text-primary" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">Phone</p>
											<p className="text-gray-600">{schoolData.phone}</p>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
											<Mail className="w-6 h-6 text-blue-600" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">Email</p>
											<p className="text-gray-600">{schoolData.email}</p>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
											<MapPin className="w-6 h-6 text-red-600" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">Address</p>
											<p className="text-gray-600">{schoolData.address}</p>
										</div>
									</div>
								</div>

								<div className="mt-8 pt-8 border-t border-gray-200">
									<h4 className="font-semibold text-gray-900 mb-4">
										Office Hours
									</h4>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-gray-600">Monday - Friday</span>
											<span className="text-gray-900 font-medium">
												9:00 AM - 5:00 PM
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Saturday</span>
											<span className="text-gray-900 font-medium">
												9:00 AM - 1:00 PM
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-lg p-8">
							<h3 className="text-2xl font-bold text-gray-900 mb-6">Find Us</h3>
							<GoogleMap address={schoolData.address} />
							<div className="mt-6 space-y-4">
								<div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
									<span className="font-medium text-gray-900">Visit Days</span>
									<span className="text-gray-600">Monday - Friday</span>
								</div>
								<div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
									<span className="font-medium text-gray-900">
										Admission Period
									</span>
									<span className="text-gray-600">January - March</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
						<div className="space-y-4">
							<div className="flex items-center space-x-3">
								<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1">
									<Image
										src={schoolData.logo}
										alt="Institution Logo"
										width={40}
										height={40}
										className="rounded-full object-cover"
									/>
								</div>
								<div>
									<h3 className="text-xl font-bold">{schoolData.name}</h3>
									<p className="text-sm text-gray-400">
										Excellence in Education
									</p>
								</div>
							</div>
							<p className="text-gray-400 leading-relaxed">
								Empowering minds for tomorrow's challenges through quality
								education and character development.
							</p>
						</div>

						<div>
							<h4 className="text-lg font-semibold mb-4 text-orange-300">
								Quick Links
							</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<a
										href="#about"
										className="hover:text-white transition-colors"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#programs"
										className="hover:text-white transition-colors"
									>
										Programs
									</a>
								</li>
								<li>
									<a
										href="#notices"
										className="hover:text-white transition-colors"
									>
										News
									</a>
								</li>
								<li>
									<a
										href="#contact"
										className="hover:text-white transition-colors"
									>
										Contact
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="text-lg font-semibold mb-4 text-orange-300">
								Admissions
							</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Student Portal
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Admission Requirements
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Fee Structure
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Scholarships
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="text-lg font-semibold mb-4 text-orange-300">
								Contact Info
							</h4>
							<div className="space-y-2 text-gray-400">
								<p>{schoolData.address}</p>
								<p>Phone: {schoolData.phone}</p>
								<p>Email: {schoolData.email}</p>
							</div>
						</div>
					</div>

					<div className="border-t border-gray-700 pt-8">
						<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
							<p className="text-gray-400 text-sm">
								© {new Date().getFullYear()} {schoolData.name}. All rights
								reserved.
							</p>
							<div className="flex gap-6">
								<Link
									href="#"
									className="text-gray-400 text-sm hover:text-white transition-colors"
								>
									Privacy Policy
								</Link>
								<Link
									href="#"
									className="text-gray-400 text-sm hover:text-white transition-colors"
								>
									Terms of Service
								</Link>
							</div>
						</div>
					</div>
				</div>
			</footer>

			{/* WhatsApp Chat Button */}
			<div className="fixed bottom-6 right-6 z-50">
				<a
					href={`https://wa.me/${schoolData.phone}?text=Hello! I'd like to know more about ${schoolData.name}.`}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-block"
				>
					<Button
						size="lg"
						className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
					>
						<MessageCircle className="w-6 h-6" />
					</Button>
				</a>
			</div>
		</div>
	)
}
