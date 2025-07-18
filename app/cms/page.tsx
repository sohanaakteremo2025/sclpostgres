// // app/dashboard/page.tsx
// import { cachedGetDashboardData } from '@/lib/actions/cms-dashboard'
// import { Users, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'
// import { currencySimbols } from '@/constants/constants'
// import CardWrapper from '@/components/card-wrapper'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { RevenueChart } from './_components/revenue-chart'
// import { RecentTransactions } from './_components/recent-transactions'
// import { StatCard } from '../institution/[domain]/_components/admin-dashboard/_components/stat-card'

// export default async function Dashboard() {
// 	const dashboardData = await cachedGetDashboardData()

// 	const {
// 		totalTenants,
// 		pendingPayments,
// 		financials: { totalRevenue, totalEarnings, totalExpenses },
// 		recentTransactions,
// 		allTransactions,
// 		allTenants,
// 	} = dashboardData

// 	return (
// 		<CardWrapper title="Dashboard" icon={<Users className="h-6 w-6" />}>
// 			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
// 				<StatCard
// 					className={`${
// 						totalRevenue < 0
// 							? 'bg-red-50 text-red-600'
// 							: 'bg-green-50 text-green-600'
// 					}`}
// 					icon={
// 						totalRevenue < 0 ? (
// 							<TrendingDown className="h-6 w-6" />
// 						) : (
// 							<TrendingUp className="h-6 w-6" />
// 						)
// 					}
// 					label="Total Revenue / Loss"
// 					value={` ${currencySimbols['BDT']}${totalRevenue.toLocaleString()}`}
// 				/>
// 				<StatCard
// 					className="bg-blue-50 text-blue-600"
// 					icon={<Users className="h-6 w-6" />}
// 					label="Total Tenants"
// 					value={totalTenants.toString()}
// 				/>
// 				<StatCard
// 					className="bg-yellow-50 text-yellow-600"
// 					icon={<AlertTriangle className="h-6 w-6" />}
// 					label="Pending Payments"
// 					value={pendingPayments.toString()}
// 				/>
// 			</div>

// 			<div className="mt-6 grid gap-6 md:grid-cols-2">
// 				<Card>
// 					<CardHeader>
// 						<CardTitle>Revenue vs Expenses</CardTitle>
// 					</CardHeader>
// 					<CardContent>
// 						<RevenueChart data={allTransactions} />
// 					</CardContent>
// 				</Card>
// 				<Card>
// 					<CardHeader>
// 						<CardTitle>Recent Transactions</CardTitle>
// 					</CardHeader>
// 					<CardContent>
// 						<RecentTransactions transactions={recentTransactions} />
// 					</CardContent>
// 				</Card>
// 			</div>
// 		</CardWrapper>
// 	)
// }

import React from 'react'

export default function CMSDashboardPage() {
	return <div>CMSDashboar</div>
}
