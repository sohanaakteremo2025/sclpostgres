'use client'

import { useQuery } from '@tanstack/react-query'
import { getResultsStatistics } from '../api/results-display.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
	Users, 
	BookOpen, 
	TrendingUp, 
	TrendingDown, 
	Target, 
	Award,
	UserCheck,
	UserX
} from 'lucide-react'

interface ResultsStatisticsProps {
	filters: {
		search: string
		classId: string
		sessionId: string
		examTypeId: string
		publishedOnly: boolean
		view: string
	}
}

interface StatisticsData {
	totalExams: number
	totalStudents: number
	publishedResults: number
	unpublishedResults: number
	averagePercentage: number
	passRate: number
	topPerformers: number
	gradeDistribution: { [key: string]: number }
	recentTrends: {
		improvement: number
		decline: number
	}
}

export function ResultsStatistics({ filters }: ResultsStatisticsProps) {
	const { data: statistics, isLoading } = useQuery({
		queryKey: ['results-statistics', filters],
		queryFn: async (): Promise<StatisticsData> => {
			const response = await getResultsStatistics({
				search: filters.search || undefined,
				classId: filters.classId || undefined,
				sessionId: filters.sessionId || undefined,
				examTypeId: filters.examTypeId || undefined,
				publishedOnly: filters.publishedOnly,
			})
			
			if (!response.success) {
				throw new Error(response.error)
			}
			
			return response.data as StatisticsData
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	})

	if (isLoading || !statistics) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="h-4 bg-gray-200 rounded mb-2"></div>
								<div className="h-8 bg-gray-200 rounded"></div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	const statCards = [
		{
			title: 'Total Exams',
			value: statistics.totalExams,
			icon: BookOpen,
			description: `${statistics.publishedResults} published, ${statistics.unpublishedResults} pending`,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50'
		},
		{
			title: 'Students Evaluated',
			value: statistics.totalStudents.toLocaleString(),
			icon: Users,
			description: 'Across all selected filters',
			color: 'text-green-600',
			bgColor: 'bg-green-50'
		},
		{
			title: 'Average Score',
			value: `${statistics.averagePercentage}%`,
			icon: Target,
			description: 'Overall performance',
			color: 'text-purple-600',
			bgColor: 'bg-purple-50'
		},
		{
			title: 'Pass Rate',
			value: `${statistics.passRate}%`,
			icon: Award,
			description: `${statistics.topPerformers} top performers`,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50'
		}
	]

	return (
		<div className="space-y-6">
			{/* Overview Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{statCards.map((stat, index) => {
					const Icon = stat.icon
					return (
						<Card key={index}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											{stat.title}
										</p>
										<p className="text-2xl font-bold">
											{stat.value}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											{stat.description}
										</p>
									</div>
									<div className={`p-3 rounded-full ${stat.bgColor}`}>
										<Icon className={`h-6 w-6 ${stat.color}`} />
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{/* Grade Distribution and Trends */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Grade Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Award className="h-5 w-5" />
							Grade Distribution
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{Object.entries(statistics.gradeDistribution).map(([grade, count]) => {
							const total = Object.values(statistics.gradeDistribution).reduce((a, b) => a + b, 0)
							const percentage = (count / total) * 100
							
							return (
								<div key={grade} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Badge variant="outline">{grade}</Badge>
											<span className="text-sm text-muted-foreground">
												{count} students
											</span>
										</div>
										<span className="text-sm font-medium">
											{percentage.toFixed(1)}%
										</span>
									</div>
									<Progress value={percentage} className="h-2" />
								</div>
							)
						})}
					</CardContent>
				</Card>

				{/* Performance Trends */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Performance Trends
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Improvement vs Decline */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<UserCheck className="h-4 w-4 text-green-600" />
									<span className="text-sm">Students Improving</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg font-semibold text-green-600">
										{statistics.recentTrends.improvement}%
									</span>
								</div>
							</div>
							<Progress value={statistics.recentTrends.improvement} className="h-2" />
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<UserX className="h-4 w-4 text-red-600" />
									<span className="text-sm">Students Declining</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg font-semibold text-red-600">
										{statistics.recentTrends.decline}%
									</span>
								</div>
							</div>
							<Progress value={statistics.recentTrends.decline} className="h-2" />
						</div>

						{/* Quick Insights */}
						<div className="pt-4 border-t space-y-2">
							<h4 className="font-medium text-sm">Quick Insights</h4>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• {statistics.topPerformers} students scored above 90%</li>
								<li>• Most common grade: {Object.entries(statistics.gradeDistribution).reduce((a, b) => statistics.gradeDistribution[a[0]] > statistics.gradeDistribution[b[0]] ? a : b)[0]}</li>
								<li>• {statistics.publishedResults} of {statistics.totalExams} results published</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}