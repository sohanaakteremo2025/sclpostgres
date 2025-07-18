'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	BookOpen,
	Microscope,
	Palette,
	Globe,
	Award,
	Users,
	Target,
	Brain,
	Trophy,
	Lightbulb,
	Heart,
} from 'lucide-react'

// Types for program configuration
interface AcademicProgram {
	id: string
	title: string
	description: string
	level: string
	icon: React.ReactNode
	color: 'emerald' | 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}

interface ExtraFeature {
	id: string
	title: string
	icon: React.ReactNode
	color: string
}

// Universal features that work for all educational institutions
const universalPrograms: AcademicProgram[] = [
	{
		id: 'quality_education',
		title: 'মানসম্পন্ন শিক্ষা',
		description:
			'আধুনিক শিক্ষা পদ্ধতি ও অভিজ্ঞ শিক্ষকমণ্ডলীর মাধ্যমে গুণগত শিক্ষা।',
		level: 'সকল বিভাগ',
		icon: <BookOpen className="w-8 h-8" />,
		color: 'emerald',
	},
	{
		id: 'skill_development',
		title: 'দক্ষতা উন্নয়ন',
		description:
			'ব্যবহারিক শিক্ষা ও হাতে-কলমে প্রশিক্ষণের মাধ্যমে দক্ষতা বৃদ্ধি।',
		level: 'সব স্তরে',
		icon: <Target className="w-8 h-8" />,
		color: 'blue',
	},
	{
		id: 'character_building',
		title: 'চরিত্র গঠন',
		description: 'নৈতিক মূল্যবোধ ও সুন্দর চরিত্র গঠনে বিশেষ গুরুত্বারোপ।',
		level: 'মূল লক্ষ্য',
		icon: <Users className="w-8 h-8" />,
		color: 'green',
	},
	{
		id: 'holistic_development',
		title: 'সর্বাঙ্গীণ উন্নয়ন',
		description:
			'শিক্ষা, খেলাধুলা, সাংস্কৃতিক কার্যক্রমের মাধ্যমে সামগ্রিক বিকাশ।',
		level: 'সকল ক্ষেত্রে',
		icon: <Palette className="w-8 h-8" />,
		color: 'yellow',
	},
]

// Additional features that work universally for all institutions
const universalFeatures: ExtraFeature[] = [
	{
		id: 'modern_facilities',
		title: 'আধুনিক সুবিধা',
		icon: <Microscope className="w-6 h-6" />,
		color: 'text-emerald-600',
	},
	{
		id: 'experienced_teachers',
		title: 'অভিজ্ঞ শিক্ষক',
		icon: <Users className="w-6 h-6" />,
		color: 'text-blue-600',
	},
	{
		id: 'safe_environment',
		title: 'নিরাপদ পরিবেশ',
		icon: <Globe className="w-6 h-6" />,
		color: 'text-green-600',
	},
	{
		id: 'excellence_award',
		title: 'শ্রেষ্ঠত্বের পুরস্কার',
		icon: <Award className="w-6 h-6" />,
		color: 'text-yellow-600',
	},
	{
		id: 'student_support',
		title: 'শিক্ষার্থী সহায়তা',
		icon: <Brain className="w-6 h-6" />,
		color: 'text-purple-600',
	},
	{
		id: 'career_guidance',
		title: 'ক্যারিয়ার নির্দেশনা',
		icon: <Lightbulb className="w-6 h-6" />,
		color: 'text-red-600',
	},
	{
		id: 'community_service',
		title: 'সমাজসেবা',
		icon: <Heart className="w-6 h-6" />,
		color: 'text-indigo-600',
	},
	{
		id: 'success_rate',
		title: 'উচ্চ সফলতার হার',
		icon: <Trophy className="w-6 h-6" />,
		color: 'text-orange-600',
	},
]

// Helper function to get color classes
const getColorClasses = (color: string) => {
	const colorMap = {
		emerald: 'bg-emerald-100 text-emerald-600',
		blue: 'bg-blue-100 text-blue-600',
		green: 'bg-green-100 text-green-600',
		yellow: 'bg-yellow-100 text-yellow-600',
		purple: 'bg-purple-100 text-purple-600',
		red: 'bg-red-100 text-red-600',
	}
	return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600'
}

interface UniversalProgramsSectionProps {
	// Optional props for customization
	showTitle?: boolean
	customTitle?: string
	customSubtitle?: string
	maxPrograms?: number
	maxFeatures?: number
	className?: string
}

export default function UniversalProgramsSection({
	showTitle = true,
	customTitle,
	customSubtitle,
	maxPrograms = 4,
	maxFeatures = 8,
	className = '',
}: UniversalProgramsSectionProps) {
	const displayPrograms = universalPrograms.slice(0, maxPrograms)
	const displayFeatures = universalFeatures.slice(0, maxFeatures)

	return (
		<section
			id="programs"
			className={`py-20 bg-gradient-to-br from-emerald-50 to-emerald-100 ${className}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{showTitle && (
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold mb-4">
							<span className="text-emerald-700">
								{customTitle ? customTitle.split(' ')[0] : 'একাডেমিক'}
							</span>{' '}
							<span className="text-amber-600">
								{customTitle
									? customTitle.split(' ').slice(1).join(' ')
									: 'প্রোগ্রাম'}
							</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							{customSubtitle ||
								'বিভিন্ন আগ্রহ এবং ক্যারিয়ারের লক্ষ্য অনুযায়ী আমাদের বৈচিত্র্যময় প্রোগ্রামসমূহ।'}
						</p>
					</div>
				)}

				{/* Main Programs Grid */}
				<div
					className={`grid ${
						displayPrograms.length === 1
							? 'grid-cols-1 max-w-md mx-auto'
							: displayPrograms.length === 2
								? 'md:grid-cols-2 max-w-4xl mx-auto'
								: displayPrograms.length === 3
									? 'md:grid-cols-2 lg:grid-cols-3'
									: 'md:grid-cols-2 lg:grid-cols-4'
					} gap-6 mb-12`}
				>
					{displayPrograms.map(program => (
						<Card
							key={program.id}
							className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
						>
							<CardHeader className="text-center">
								<div
									className={`w-16 h-16 ${getColorClasses(program.color)} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
								>
									{program.icon}
								</div>
								<CardTitle className="text-lg group-hover:text-emerald-700 transition-colors">
									{program.title}
								</CardTitle>
								<CardDescription className="font-medium text-emerald-600">
									{program.level}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-center">
								<p className="text-gray-600 text-sm leading-relaxed">
									{program.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Additional Features Grid */}
				<div
					className={`grid ${
						displayFeatures.length <= 4
							? 'md:grid-cols-4'
							: displayFeatures.length <= 6
								? 'md:grid-cols-3 lg:grid-cols-6'
								: 'md:grid-cols-4 lg:grid-cols-4'
					} gap-6`}
				>
					{displayFeatures.map(feature => (
						<div
							key={feature.id}
							className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
						>
							<div className="group-hover:scale-110 transition-transform duration-300">
								<div className={feature.color}>{feature.icon}</div>
							</div>
							<span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
								{feature.title}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

// Example usage variations for different institution types:

// For Schools:
export function SchoolProgramsSection() {
	return (
		<UniversalProgramsSection
			customTitle="আমাদের বৈশিষ্ট্য"
			customSubtitle="শিক্ষার্থীদের সামগ্রিক উন্নয়নে আমাদের প্রতিশ্রুতি ও বিশেষত্ব।"
			maxPrograms={4}
			maxFeatures={6}
		/>
	)
}

// For Colleges:
export function CollegeProgramsSection() {
	return (
		<UniversalProgramsSection
			customTitle="প্রতিষ্ঠানের শক্তি"
			customSubtitle="উচ্চ শিক্ষার মান ও শিক্ষার্থী সেবায় আমাদের অগ্রাধিকার।"
			maxPrograms={4}
			maxFeatures={8}
		/>
	)
}

// For Madrasas:
export function MadrasaProgramsSection() {
	return (
		<UniversalProgramsSection
			customTitle="আমাদের অগ্রাধিকার"
			customSubtitle="ইসলামিক মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে শিক্ষার্থী গঠন।"
			maxPrograms={4}
			maxFeatures={6}
		/>
	)
}

// For Universities:
export function UniversityProgramsSection() {
	return (
		<UniversalProgramsSection
			customTitle="প্রতিষ্ঠানের গুণাবলী"
			customSubtitle="গবেষণা, উৎকর্ষতা ও সেবায় আমাদের অঙ্গীকার।"
			maxPrograms={4}
			maxFeatures={8}
		/>
	)
}
