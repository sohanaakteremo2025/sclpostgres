import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface StatCardProps {
	title: string
	value: string | number
	change?: number
	icon: React.ReactNode
	description?: string
	trend?: 'up' | 'down' | 'neutral'
	className?: string
}

export function StatCard({
	title,
	value,
	change,
	icon,
	description,
	trend = 'neutral',
	className,
}: StatCardProps) {
	const formatValue = (val: string | number) => {
		if (typeof val === 'number') {
			return new Intl.NumberFormat('en-BD', {
				style: 'currency',
				currency: 'BDT',
				minimumFractionDigits: 0,
			}).format(val)
		}
		return val
	}

	return (
		<Card className={`hover:shadow-md transition-shadow ${className || ''}`}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				<div className="text-muted-foreground">{icon}</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">
					{typeof value === 'number' ? formatValue(value) : value}
				</div>
				{change !== undefined && (
					<div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
						{trend === 'up' && (
							<TrendingUp className="w-3 h-3 text-green-500" />
						)}
						{trend === 'down' && (
							<TrendingDown className="w-3 h-3 text-red-500" />
						)}
						<span
							className={
								trend === 'up'
									? 'text-green-500'
									: trend === 'down'
										? 'text-red-500'
										: ''
							}
						>
							{change > 0 ? '+' : ''}
							{change}%
						</span>
					</div>
				)}
				{description && (
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
				)}
			</CardContent>
		</Card>
	)
}
