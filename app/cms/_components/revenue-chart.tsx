'use client'

import {
	Bar,
	BarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
} from 'recharts'
import { formatMoney } from '@/utils/format-money'

export function RevenueChart({ data }: { data: any[] }) {
	// Process the transaction data to aggregate by month
	const chartData = data.reduce((acc, transaction) => {
		const date = new Date(transaction.createdAt).toLocaleDateString('en-US', {
			month: 'short',
		})

		if (!acc[date]) {
			acc[date] = { name: date, income: 0, expense: 0 }
		}

		// Match the capitalized transaction types from the database
		if (transaction.type === 'INCOME') {
			acc[date].income += Number(transaction.amount)
		} else if (transaction.type === 'EXPENSE') {
			acc[date].expense += Number(transaction.amount)
		}

		return acc
	}, {})

	const formattedData = Object.values(chartData)

	return (
		<ResponsiveContainer width="100%" height={350}>
			<BarChart data={formattedData}>
				<XAxis
					dataKey="name"
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
					tickFormatter={value => `${formatMoney(value as number)}`}
				/>
				<Tooltip formatter={value => `${formatMoney(value as number)}`} />
				<Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
				<Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	)
}
