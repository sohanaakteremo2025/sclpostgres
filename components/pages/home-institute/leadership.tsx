'use client'
import { Quote } from '@prisma/client'
import Image from 'next/image'
import { useState } from 'react'
import { Hind_Siliguri } from 'next/font/google'

// Import Hind Siliguri font
const hindSiliguri = Hind_Siliguri({
	subsets: ['latin'],
	weight: ['400', '600', '700'],
})

const QuoteCard = ({ quote }: { quote: Quote }) => {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow max-w-xl mx-auto h-fit">
			<div className="relative h-64">
				<Image
					width={800}
					height={600}
					src={quote.imageUrl || '/placeholder-profile.jpg'}
					alt={`${quote.authorName}'s profile`}
					className="w-full h-full object-cover object-top"
					priority={false}
				/>
				<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
					<h3 className="text-white text-2xl font-bold">{quote.authorName}</h3>
					{quote.role && (
						<p className="text-gray-300 font-medium">{quote.role}</p>
					)}
				</div>
			</div>
			<div className="p-6">
				<blockquote
					dangerouslySetInnerHTML={{ __html: quote.quote }}
					className={`text-gray-600 text-md relative pl-4 leading-relaxed transition-all ${
						hindSiliguri.className
					} ${isExpanded ? 'line-clamp-none' : 'line-clamp-4'}`}
				>
					{/* {quote.quote} */}
				</blockquote>
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="mt-2 flex items-center ml-auto text-blue-500 text-sm hover:underline"
				>
					{isExpanded ? 'Show less' : 'Show more...'}
					{/* {isExpanded ? (
						<ChevronUp className="ml-1 w-4 h-4" />
					) : (
						<ChevronDown className="ml-1 w-4 h-4" />
					)} */}
				</button>
			</div>
		</div>
	)
}
const SkeletonCard = () => (
	<div className="bg-gray-100 rounded-xl overflow-hidden shadow animate-pulse">
		<div className="h-64 bg-gray-200" />
		<div className="p-6">
			<div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
			<div className="h-4 bg-gray-200 rounded w-1/2" />
		</div>
	</div>
)

export default function Leadership({ data }: { data: { quotes?: Quote[] } }) {
	const quotes = data?.quotes || []
	const isLoading = !data?.quotes

	const getGridColumns = (length: number) => {
		if (length === 0) return 'lg:grid-cols-3'
		if (length === 1) return 'lg:grid-cols-1'
		if (length === 2) return 'lg:grid-cols-2'
		return 'lg:grid-cols-3'
	}

	return (
		<section className="py-20 bg-white">
			<div className="container mx-auto px-6">
				<h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
					Our Leadership
				</h2>
				<div
					className={`grid grid-cols-1 ${getGridColumns(
						quotes.length,
					)} gap-12 max-w-7xl mx-auto`}
				>
					{isLoading ? (
						[...Array(3)].map((_, i) => <SkeletonCard key={i} />)
					) : quotes.length === 0 ? (
						<div className="col-span-full text-center text-gray-500">
							No leadership quotes available at this time.
						</div>
					) : (
						quotes.map((quote, index) => (
							<QuoteCard key={quote.id || index} quote={quote} />
						))
					)}
				</div>
			</div>
		</section>
	)
}
