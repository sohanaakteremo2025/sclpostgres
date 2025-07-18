import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from './StatCard'
import {
	GraduationCap,
	Users,
	BookOpen,
	UserPlus,
	UserCheck,
	Target,
} from 'lucide-react'
import type { AcademicStats } from '../types'

interface PremiumAcademicOverviewProps {
	stats: AcademicStats
}

export function PremiumAcademicOverview({
	stats,
}: PremiumAcademicOverviewProps) {
	const attendanceColor =
		stats.attendanceRate >= 90
			? 'default'
			: stats.attendanceRate >= 80
				? 'secondary'
				: 'destructive'

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<GraduationCap className="w-5 h-5 text-primary" />
					<h2 className="text-lg font-semibold">Academic Overview</h2>
				</div>
				<div className="flex items-center space-x-2">
					<Badge variant={attendanceColor} className="text-xs">
						Attendance: {stats.attendanceRate}%
					</Badge>
					<Badge
						variant={stats.studentGrowth >= 0 ? 'default' : 'destructive'}
						className="text-xs"
					>
						Growth: {stats.studentGrowth > 0 ? '+' : ''}
						{stats.studentGrowth}%
					</Badge>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Students"
					value={stats.totalStudents.toLocaleString()}
					icon={<Users className="w-4 h-4" />}
					change={stats.studentGrowth}
					trend={stats.studentGrowth >= 0 ? 'up' : 'down'}
					description="Enrolled students"
				/>

				<StatCard
					title="Active Students"
					value={stats.activeStudents.toLocaleString()}
					icon={<UserCheck className="w-4 h-4" />}
					description="Currently attending"
					className="border-green-200 bg-green-50/50"
				/>

				<StatCard
					title="Teaching Staff"
					value={stats.totalTeachers.toString()}
					icon={<BookOpen className="w-4 h-4" />}
					change={2}
					trend="up"
					description="Faculty members"
				/>

				<StatCard
					title="New Admissions"
					value={stats.newAdmissions.toString()}
					icon={<UserPlus className="w-4 h-4" />}
					description="This month"
					className="border-blue-200 bg-blue-50/50"
				/>
			</div>

			{/* Student-Teacher Ratio and Metrics */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Student-Teacher Ratio
								</p>
								<p className="text-2xl font-bold">
									{Math.round(stats.totalStudents / stats.totalTeachers)}:1
								</p>
							</div>
							<Target className="w-8 h-8 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>

				<Card className="">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Attendance Rate
								</p>
								<p className="text-2xl font-bold">{stats.attendanceRate}%</p>
							</div>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center ${
									stats.attendanceRate >= 90
										? 'bg-green-100 text-green-600'
										: stats.attendanceRate >= 80
											? 'bg-yellow-100 text-yellow-600'
											: 'bg-red-100 text-red-600'
								}`}
							>
								<UserCheck className="w-4 h-4" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Capacity
								</p>
								<p className="text-2xl font-bold">
									{Math.round(
										(stats.activeStudents / stats.totalStudents) * 100,
									)}
									%
								</p>
							</div>
							<div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
								<Users className="w-4 h-4" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
