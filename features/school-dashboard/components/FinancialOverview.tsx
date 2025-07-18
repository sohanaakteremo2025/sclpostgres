'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from './StatCard'
import { AccountBalanceCard } from './AccountBalanceCard'
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	AlertCircle,
	Wallet,
	Receipt,
	CreditCard,
	BadgePercent,
	Eye,
	EyeOff,
} from 'lucide-react'
import type { PaymentStats } from '../types'

interface FinancialOverviewProps {
	stats: PaymentStats
}

export function FinancialOverview({ stats }: FinancialOverviewProps) {
	const [showAccountDetails, setShowAccountDetails] = React.useState(false)

	const netIncomeToday = stats.todayIncome - stats.todayExpense
	const netIncomeWeek = stats.weekIncome - stats.weekExpense
	const netIncomeMonth = stats.monthIncome - stats.monthExpense

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<DollarSign className="w-5 h-5 text-primary" />
					<h2 className="text-lg font-semibold">Financial Overview</h2>
				</div>
				<div className="flex items-center space-x-2">
					<Badge variant="outline" className="text-xs">
						Collection Rate: {stats.collectionRate}%
					</Badge>
					<Badge
						variant={stats.monthlyGrowth >= 0 ? 'default' : 'destructive'}
						className="text-xs"
					>
						Growth: {stats.monthlyGrowth > 0 ? '+' : ''}
						{stats.monthlyGrowth}%
					</Badge>
				</div>
			</div>

			{/* Primary Financial Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Today's Income"
					value={stats.todayIncome}
					icon={<TrendingUp className="w-4 h-4" />}
					change={12}
					trend="up"
					description={`Net: ${netIncomeToday >= 0 ? '+' : ''}৳${netIncomeToday.toLocaleString()}`}
				/>
				<StatCard
					title="Today's Expense"
					value={stats.todayExpense}
					icon={<TrendingDown className="w-4 h-4" />}
					change={-5}
					trend="down"
					description="Operational costs"
				/>
				<StatCard
					title="Outstanding Dues"
					value={stats.totalDues}
					icon={<AlertCircle className="w-4 h-4" />}
					description="Pending collections"
					className="border-orange-200 bg-orange-50/50"
				/>
				<StatCard
					title="Total Balance"
					value={stats.totalAccountBalance}
					icon={<Wallet className="w-4 h-4" />}
					change={8}
					trend="up"
					description={`${stats.accountBalances.length} accounts`}
				/>
			</div>

			{/* Time Period Metrics */}
			<div className="grid gap-4 md:grid-cols-3">
				<StatCard
					title="Weekly Performance"
					value={stats.weekIncome}
					icon={<Receipt className="w-4 h-4" />}
					change={stats.weeklyGrowth}
					trend={stats.weeklyGrowth >= 0 ? 'up' : 'down'}
					description={`Net: ৳${netIncomeWeek.toLocaleString()}`}
				/>
				<StatCard
					title="Monthly Performance"
					value={stats.monthIncome}
					icon={<CreditCard className="w-4 h-4" />}
					change={stats.monthlyGrowth}
					trend={stats.monthlyGrowth >= 0 ? 'up' : 'down'}
					description={`Net: ৳${netIncomeMonth.toLocaleString()}`}
				/>
				<StatCard
					title="Waivers & Discounts"
					value={stats.totalWaivers}
					icon={<BadgePercent className="w-4 h-4" />}
					description="Total concessions"
					className="border-blue-200 bg-blue-50/50"
				/>
			</div>

			{/* Account Balances Section */}
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-semibold">
							Account Balances
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowAccountDetails(!showAccountDetails)}
							className="text-xs"
						>
							{showAccountDetails ? (
								<>
									<EyeOff className="w-3 h-3 mr-1" />
									Hide Details
								</>
							) : (
								<>
									<Eye className="w-3 h-3 mr-1" />
									Show Details
								</>
							)}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{showAccountDetails ? (
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{stats.accountBalances.map(account => (
								<AccountBalanceCard key={account.id} account={account} />
							))}
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{stats.accountBalances.slice(0, 4).map(account => (
								<div
									key={account.id}
									className="flex items-center justify-between p-3 rounded-lg border bg-card"
								>
									<div>
										<p className="font-medium text-sm">{account.title}</p>
										<p className="text-xs text-muted-foreground">
											{account.type}
										</p>
									</div>
									<p className="font-bold text-sm">
										৳{account.balance.toLocaleString()}
									</p>
								</div>
							))}
							{stats.accountBalances.length > 4 && (
								<div className="flex items-center justify-center p-3 rounded-lg border bg-muted/50">
									<p className="text-sm text-muted-foreground">
										+{stats.accountBalances.length - 4} more
									</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
