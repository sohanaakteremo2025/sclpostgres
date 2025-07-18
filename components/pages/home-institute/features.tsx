import React from 'react'
import { BookOpen, Users, Trophy } from 'lucide-react'

const features = [
	{
		icon: BookOpen,
		title: 'Modern Curriculum',
		description:
			'Comprehensive education blending traditional values with modern teaching methods',
	},
	{
		icon: Users,
		title: 'Expert Faculty',
		description:
			'Dedicated teachers with years of experience in nurturing young minds',
	},
	{
		icon: Trophy,
		title: 'Excellence Track',
		description:
			'Proven record of academic excellence and extracurricular achievements',
	},
]

export function Features() {
	return (
		<div className="py-20">
			<div className="container mx-auto px-6">
				<h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
					Why Choose Us?
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
					{features.map((feature, index) => (
						<div key={index} className="group">
							<div className="bg-emerald-50 p-8 rounded-xl hover:bg-emerald-100 transition-all">
								<div className="bg-emerald-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
									<feature.icon className="w-8 h-8 text-white" />
								</div>
								<h3 className="text-xl font-semibold mb-4 text-zinc-800">
									{feature.title}
								</h3>
								<p className="text-gray-600">{feature.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
