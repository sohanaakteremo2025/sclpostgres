'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from 'recharts'
import {
	Users,
	UserCheck,
	UserX,
	TrendingUp,
	TrendingDown,
	Award,
	Target,
} from 'lucide-react'

interface ResultStatisticsProps {
	examSchedule: {
		id: string
		exam: {
			title: string
			examType: { name: string }
		}
		subject: { name: string }
		class: { name: string }
		section: { name: string } | null
		components: Array<{
			id: string
			name: string
			maxMarks: number
		}>
	}
	statistics: {
		totalStudents: number
		presentStudents: number
		absentStudents: number
		averagePercentage: number
		highestMarks: number
		lowestMarks: number
		gradeDistribution: Record<string, number>
	}
	results: Array<{
		id: string
		obtainedMarks: number
		totalMarks: number
		percentage: number | null
		grade: string | null
		isAbsent: boolean
		student: {
			id: string
			name: string
			roll: string
		}
		componentResults: Array<{
			obtainedMarks: number
			isAbsent: boolean
			examComponent: {
				name: string
				maxMarks: number
			}
		}>
	}>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function ResultStatistics({
	examSchedule,
	statistics,
	results,
}: ResultStatisticsProps) {
	const [componentStats, setComponentStats] = useState<any[]>([])
	const [gradeChartData, setGradeChartData] = useState<any[]>([])
	const [performanceBands, setPerformanceBands] = useState<any[]>([])

	useEffect(() => {
		// Calculate component-wise statistics
		const componentStatsMap = new Map()

		results.forEach(result => {
			if (!result.isAbsent) {
				result.componentResults.forEach(cr => {
					const componentName = cr.examComponent.name
					if (!componentStatsMap.has(componentName)) {
						componentStatsMap.set(componentName, {
							name: componentName,
							maxMarks: cr.examComponent.maxMarks,
							totalObtained: 0,
							totalMax: 0,
							count: 0,
							highest: 0,
							lowest: cr.examComponent.maxMarks,
						})
					}

					const stat = componentStatsMap.get(componentName)
					stat.totalObtained += cr.obtainedMarks
					stat.totalMax += cr.examComponent.maxMarks
					stat.count += 1
					stat.highest = Math.max(stat.highest, cr.obtainedMarks)
					stat.lowest = Math.min(stat.lowest, cr.obtainedMarks)
				})
			}
		})

		const componentStatsArray = Array.from(componentStatsMap.values()).map(stat => ({
			...stat,
			averagePercentage: (stat.totalObtained / stat.totalMax) * 100,
		}))

		setComponentStats(componentStatsArray)

		// Prepare grade distribution chart data
		const gradeData = Object.entries(statistics.gradeDistribution).map(([grade, count]) => ({
			grade,
			count,
		}))
		setGradeChartData(gradeData)

		// Calculate performance bands
		const presentResults = results.filter(r => !r.isAbsent)
		const bands = [
			{ name: '90-100%', min: 90, max: 100, count: 0, color: '#22C55E' },
			{ name: '80-89%', min: 80, max: 89, count: 0, color: '#3B82F6' },
			{ name: '70-79%', min: 70, max: 79, count: 0, color: '#F59E0B' },
			{ name: '60-69%', min: 60, max: 69, count: 0, color: '#EF4444' },
			{ name: '50-59%', min: 50, max: 59, count: 0, color: '#8B5CF6' },
			{ name: 'Below 50%', min: 0, max: 49, count: 0, color: '#6B7280' },
		]

		presentResults.forEach(result => {
			const percentage = result.percentage || 0
			bands.forEach(band => {
				if (percentage >= band.min && percentage <= band.max) {
					band.count += 1
				}
			})
		})

		setPerformanceBands(bands)
	}, [results, statistics])

	const topPerformers = results
		.filter(r => !r.isAbsent)
		.sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
		.slice(0, 5)

	const passPercentage = (statistics.presentStudents > 0 
		? (results.filter(r => !r.isAbsent && (r.percentage || 0) >= 40).length / statistics.presentStudents) * 100 
		: 0)

	return (
		<div className="space-y-6">
			{/* Exam Info */}
			<Card>
				<CardHeader>
					<CardTitle>Exam Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<div className="text-sm text-muted-foreground">Exam</div>
							<div className="font-medium">{examSchedule.exam.title}</div>
							<div className="text-xs text-muted-foreground">
								{examSchedule.exam.examType.name}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Subject</div>
							<div className="font-medium">{examSchedule.subject.name}</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Class & Section</div>
							<div className="font-medium">
								{examSchedule.class.name}
								{examSchedule.section && ` - ${examSchedule.section.name}`}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Overview Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Students</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{statistics.totalStudents}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Present</CardTitle>
						<UserCheck className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{statistics.presentStudents}
						</div>
						<p className="text-xs text-muted-foreground">
							{statistics.totalStudents > 0
								? ((statistics.presentStudents / statistics.totalStudents) * 100).toFixed(1)
								: 0}
							% attendance
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Absent</CardTitle>
						<UserX className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{statistics.absentStudents}
						</div>
						<p className="text-xs text-muted-foreground">
							{statistics.totalStudents > 0
								? ((statistics.absentStudents / statistics.totalStudents) * 100).toFixed(1)
								: 0}
							% absent
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Class Average</CardTitle>
						<Target className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{statistics.averagePercentage.toFixed(1)}%
						</div>
						<Progress value={statistics.averagePercentage} className="mt-2" />
					</CardContent>
				</Card>
			</div>

			{/* Performance Overview */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Award className="h-5 w-5" />
							Performance Overview
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Highest Score</span>
								<Badge variant="default" className="text-lg">
									{statistics.highestMarks}
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Lowest Score</span>
								<Badge variant="secondary" className="text-lg">
									{statistics.lowestMarks}
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Pass Rate (≥40%)</span>
								<Badge variant="outline" className="text-lg">
									{passPercentage.toFixed(1)}%
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Grade Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={200}>
							<PieChart>
								<Pie
									data={gradeChartData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ grade, count }) => `${grade}: ${count}`}
									outerRadius={80}
									fill="#8884d8"
									dataKey="count"
								>
									{gradeChartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Performance Bands */}
			<Card>
				<CardHeader>
					<CardTitle>Performance Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={performanceBands}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="count" fill="#8884d8">
								{performanceBands.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Component-wise Analysis */}
			{componentStats.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Component-wise Performance</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Component</TableHead>
									<TableHead>Max Marks</TableHead>
									<TableHead>Average %</TableHead>
									<TableHead>Highest</TableHead>
									<TableHead>Lowest</TableHead>
									<TableHead>Performance</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{componentStats.map(stat => (
									<TableRow key={stat.name}>
										<TableCell className="font-medium">{stat.name}</TableCell>
										<TableCell>{stat.maxMarks}</TableCell>
										<TableCell>
											<Badge variant="outline">
												{stat.averagePercentage.toFixed(1)}%
											</Badge>
										</TableCell>
										<TableCell>{stat.highest}</TableCell>
										<TableCell>{stat.lowest}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Progress value={stat.averagePercentage} className="flex-1" />
												{stat.averagePercentage >= 70 ? (
													<TrendingUp className="h-4 w-4 text-green-600" />
												) : (
													<TrendingDown className="h-4 w-4 text-red-600" />
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* Top Performers */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Award className="h-5 w-5 text-yellow-600" />
						Top Performers
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Rank</TableHead>
								<TableHead>Student</TableHead>
								<TableHead>Roll</TableHead>
								<TableHead>Score</TableHead>
								<TableHead>Percentage</TableHead>
								<TableHead>Grade</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{topPerformers.map((result, index) => (
								<TableRow key={result.id}>
									<TableCell>
										<Badge variant={index === 0 ? 'default' : 'outline'}>
											#{index + 1}
										</Badge>
									</TableCell>
									<TableCell className="font-medium">
										{result.student.name}
									</TableCell>
									<TableCell>{result.student.roll}</TableCell>
									<TableCell>
										{result.obtainedMarks}/{result.totalMarks}
									</TableCell>
									<TableCell>
										<Badge variant="default">
											{(result.percentage || 0).toFixed(1)}%
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{result.grade}</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}