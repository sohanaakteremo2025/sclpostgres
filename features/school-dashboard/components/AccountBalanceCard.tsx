import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Building2, Smartphone, CircleDollarSign } from 'lucide-react'
import type { AccountBalance } from '../types'

interface AccountBalanceCardProps {
	account: AccountBalance
}

const accountTypeIcons = {
	CASH: <Wallet className="w-4 h-4" />,
	BANK: <Building2 className="w-4 h-4" />,
	MOBILE_BANKING: <Smartphone className="w-4 h-4" />,
	OTHER: <CircleDollarSign className="w-4 h-4" />,
}

const accountTypeColors = {
	CASH: 'bg-green-50 border-green-200 text-green-700',
	BANK: 'bg-blue-50 border-blue-200 text-blue-700',
	MOBILE_BANKING: 'bg-purple-50 border-purple-200 text-purple-700',
	OTHER: 'bg-gray-50 border-gray-200 text-gray-700',
}

export function AccountBalanceCard({ account }: AccountBalanceCardProps) {
	const formatLastUpdated = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffInHours = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60),
		)

		if (diffInHours < 1) return 'Just now'
		if (diffInHours < 24) return `${diffInHours}h ago`
		return date.toLocaleDateString()
	}

	const isLowBalance = account.balance < 10000

	return (
		<Card
			className={`transition-all hover:shadow-md ${accountTypeColors[account.type]} ${isLowBalance ? 'ring-1 ring-orange-300' : ''}`}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center space-x-2">
						{accountTypeIcons[account.type]}
						<div>
							<p className="font-medium text-sm">{account.title}</p>
							<p className="text-xs opacity-70">
								{account.type.replace('_', ' ')}
							</p>
						</div>
					</div>
					{isLowBalance && (
						<Badge
							variant="outline"
							className="text-xs border-orange-400 text-orange-600"
						>
							Low
						</Badge>
					)}
				</div>

				<div className="space-y-2">
					<p className="text-xl font-bold">
						৳{account.balance.toLocaleString()}
					</p>
					<p className="text-xs opacity-60">
						Updated {formatLastUpdated(account.lastUpdated)}
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
