import React from 'react'
import { Users, GraduationCap, Trophy, BookOpen } from 'lucide-react'

const stats = [
	{ icon: Users, label: 'Students', value: '2,500+' },
	{ icon: GraduationCap, label: 'Graduates', value: '15,000+' },
	{ icon: Trophy, label: 'Awards', value: '200+' },
	{ icon: BookOpen, label: 'Courses', value: '50+' },
]

export function Stats() {
	return (
		<div className="bg-emerald-50 py-16">
			<div className="container mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{stats.map((stat, index) => (
						<div
							key={index}
							className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow"
						>
							<stat.icon className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
							<h3 className="text-3xl font-bold text-gray-800 mb-2">
								{stat.value}
							</h3>
							<p className="text-gray-600">{stat.label}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
