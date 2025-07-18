import React, { Suspense } from 'react'
import {
	getCachedDashboardStats,
	getDashboardStats,
} from '@/features/school-dashboard/api/dashboard.action'
import { FinancialOverview } from '@/features/school-dashboard/components/FinancialOverview'
import { PremiumIncomeChart } from '@/features/school-dashboard/components/IncomeChart'
import { PremiumAcademicOverview } from '@/features/school-dashboard/components/AcademicOverview'
import { PremiumClassSummary } from '@/features/school-dashboard/components/ClassSummary'
import { DashboardSkeleton } from '@/features/school-dashboard/components/DashboardSkeleton'
import type { DashboardStats } from '@/features/school-dashboard/types'
import { getTenantId } from '@/lib/tenant'
import CardWrapper from '@/components/card-wrapper'
import { LayoutDashboard, TrendingUp, Target, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Quick Insights Component
function QuickInsights({ stats }: { stats: DashboardStats }) {
	const insights = [
		{
			icon: <TrendingUp className="w-4 h-4" />,
			title: 'Revenue Growth',
			value: `${stats.payment.monthlyGrowth > 0 ? '+' : ''}${stats.payment.monthlyGrowth}%`,
			description: 'vs last month',
			color:
				stats.payment.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600',
		},
		{
			icon: <Target className="w-4 h-4" />,
			title: 'Collection Rate',
			value: `${stats.payment.collectionRate}%`,
			description: 'fee collection',
			color:
				stats.payment.collectionRate >= 80
					? 'text-green-600'
					: 'text-orange-600',
		},
		{
			icon: <Activity className="w-4 h-4" />,
			title: 'Student Growth',
			value: `${stats.academic.studentGrowth > 0 ? '+' : ''}${stats.academic.studentGrowth}%`,
			description: 'enrollment rate',
			color:
				stats.academic.studentGrowth >= 0 ? 'text-green-600' : 'text-red-600',
		},
	]

	return (
		<div className="grid gap-4 md:grid-cols-3 mb-6">
			{insights.map((insight, index) => (
				<Card
					key={index}
					className="bg-gradient-to-br from-white to-gray-50/50"
				>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<div className="p-2 bg-primary/10 rounded-lg">
									{insight.icon}
								</div>
								<div>
									<p className="text-xs text-muted-foreground">
										{insight.title}
									</p>
									<p className={`text-lg font-bold ${insight.color}`}>
										{insight.value}
									</p>
								</div>
							</div>
							<p className="text-xs text-muted-foreground">
								{insight.description}
							</p>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

// Dashboard Content Component
async function DashboardContent() {
	const tenantId = await getTenantId()
	const stats: DashboardStats = await getCachedDashboardStats(tenantId)

	return (
		<div className="space-y-6">
			{/* Quick Insights */}
			<QuickInsights stats={stats} />

			{/* Financial Overview Section */}
			<FinancialOverview stats={stats.payment} />

			{/* Income Chart with Time Period Selection */}
			<PremiumIncomeChart stats={stats.payment} />

			{/* Academic Overview Section */}
			<PremiumAcademicOverview stats={stats.academic} />

			{/* Class Summary Section */}
			<PremiumClassSummary classes={stats.academic.classSummary} />
		</div>
	)
}

// Main Dashboard Page
export default async function PremiumDashboardPage() {
	return (
		<CardWrapper
			title="School Dashboard"
			description="Comprehensive overview of your institution's performance"
			icon={<LayoutDashboard />}
		>
			<div className="space-y-6">
				<Suspense fallback={<DashboardSkeleton />}>
					<DashboardContent />
				</Suspense>
			</div>
		</CardWrapper>
	)
}
