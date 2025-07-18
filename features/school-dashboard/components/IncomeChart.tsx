'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Line,
	LineChart,
	Area,
	AreaChart,
} from 'recharts'
import {
	Calendar,
	CalendarDays,
	CalendarRange,
	TrendingUp,
	BarChart3,
	LineChart as LineChartIcon,
	AreaChart as AreaChartIcon,
} from 'lucide-react'
import type { PaymentStats, TimePeriod } from '../types'

interface PremiumIncomeChartProps {
	stats: PaymentStats
	className?: string
}

type ChartType = 'bar' | 'line' | 'area'

export function PremiumIncomeChart({
	stats,
	className,
}: PremiumIncomeChartProps) {
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly')
	const [chartType, setChartType] = useState<ChartType>('bar')

	const periodData = {
		daily: stats.dailyComparison,
		weekly: stats.weeklyComparison,
		monthly: stats.monthlyComparison,
	}

	const periodConfig = {
		daily: {
			icon: <Calendar className="w-3 h-3" />,
			label: 'Daily',
			description: 'Last 30 days',
		},
		weekly: {
			icon: <CalendarDays className="w-3 h-3" />,
			label: 'Weekly',
			description: 'Last 12 weeks',
		},
		monthly: {
			icon: <CalendarRange className="w-3 h-3" />,
			label: 'Monthly',
			description: 'Last 12 months',
		},
	}

	const chartConfig = {
		bar: { icon: <BarChart3 className="w-3 h-3" />, label: 'Bar Chart' },
		line: { icon: <LineChartIcon className="w-3 h-3" />, label: 'Line Chart' },
		area: { icon: <AreaChartIcon className="w-3 h-3" />, label: 'Area Chart' },
	}

	const currentData = periodData[selectedPeriod] || []

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-BD', {
			style: 'currency',
			currency: 'BDT',
			minimumFractionDigits: 0,
		}).format(value)
	}

	const formatYAxisTick = (value: number) => {
		if (value >= 1000000) {
			return `৳${(value / 1000000).toFixed(1)}M`
		} else if (value >= 1000) {
			return `৳${(value / 1000).toFixed(0)}K`
		}
		return `৳${value}`
	}

	// Calculate metrics
	const totalIncome = currentData.reduce((sum, item) => sum + item.income, 0)
	const totalExpense = currentData.reduce((sum, item) => sum + item.expense, 0)
	const netProfit = totalIncome - totalExpense
	const profitMargin =
		totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0'

	const renderChart = () => {
		const commonProps = {
			data: currentData,
			margin: { top: 20, right: 30, left: 20, bottom: 5 },
		}

		switch (chartType) {
			case 'line':
				return (
					<LineChart {...commonProps}>
						<XAxis
							dataKey="period"
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={formatYAxisTick}
						/>
						<Tooltip
							formatter={(value: number) => [formatCurrency(value), '']}
						/>
						<Line
							type="monotone"
							dataKey="income"
							stroke="#4ade80"
							strokeWidth={3}
							dot={{ r: 4 }}
						/>
						<Line
							type="monotone"
							dataKey="expense"
							stroke="#f87171"
							strokeWidth={3}
							dot={{ r: 4 }}
						/>
					</LineChart>
				)

			case 'area':
				return (
					<AreaChart {...commonProps}>
						<XAxis
							dataKey="period"
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={formatYAxisTick}
						/>
						<Tooltip
							formatter={(value: number) => [formatCurrency(value), '']}
						/>
						<Area
							type="monotone"
							dataKey="income"
							stackId="1"
							stroke="#4ade80"
							fill="#4ade80"
							fillOpacity={0.6}
						/>
						<Area
							type="monotone"
							dataKey="expense"
							stackId="2"
							stroke="#f87171"
							fill="#f87171"
							fillOpacity={0.6}
						/>
					</AreaChart>
				)

			default:
				return (
					<BarChart {...commonProps}>
						<XAxis
							dataKey="period"
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={formatYAxisTick}
						/>
						<Tooltip
							formatter={(value: number) => [formatCurrency(value), '']}
						/>
						<Bar
							dataKey="income"
							fill="#4ade80"
							radius={[4, 4, 0, 0]}
							name="Income"
						/>
						<Bar
							dataKey="expense"
							fill="#f87171"
							radius={[4, 4, 0, 0]}
							name="Expense"
						/>
					</BarChart>
				)
		}
	}

	return (
		<Card className={` ${className || ''}`}>
			<CardHeader>
				<div className="flex items-center justify-between gap-2 flex-wrap">
					<div>
						<CardTitle className="text-base font-semibold flex items-center gap-2">
							<TrendingUp className="w-4 h-4" />
							Financial Performance
						</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							{periodConfig[selectedPeriod].description}
						</p>
					</div>

					<div className="flex items-center flex-wrap gap-2">
						{/* Time Period Selection */}
						<div className="flex rounded-lg border p-1">
							{(Object.keys(periodConfig) as TimePeriod[]).map(period => (
								<Button
									key={period}
									variant={selectedPeriod === period ? 'default' : 'ghost'}
									size="sm"
									onClick={() => setSelectedPeriod(period)}
									className="text-xs h-7"
								>
									{periodConfig[period].icon}
									{periodConfig[period].label}
								</Button>
							))}
						</div>

						{/* Chart Type Selection */}
						<div className="flex rounded-lg border p-1">
							{(Object.keys(chartConfig) as ChartType[]).map(type => (
								<Button
									key={type}
									variant={chartType === type ? 'default' : 'ghost'}
									size="sm"
									onClick={() => setChartType(type)}
									className="text-xs h-7 px-2"
								>
									{chartConfig[type].icon}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Metrics Row */}
				<div className="flex flex-wrap gap-4 pt-2">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-400 rounded-full"></div>
						<span className="text-sm font-medium">
							Income: {formatCurrency(totalIncome)}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-red-400 rounded-full"></div>
						<span className="text-sm font-medium">
							Expense: {formatCurrency(totalExpense)}
						</span>
					</div>
					<Badge
						variant={netProfit >= 0 ? 'success' : 'destructive'}
						className="text-xs"
					>
						Net: {formatCurrency(netProfit)} ({profitMargin}%)
					</Badge>
				</div>
			</CardHeader>

			<CardContent>
				<ResponsiveContainer width="100%" height={350}>
					{renderChart()}
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
