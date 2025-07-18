// components/StatusBadge.tsx
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { DueItemStatus } from '@/lib/zod'

interface StatusBadgeProps {
	status: DueItemStatus
	className?: string
}

const statusConfigs = {
	PAID: {
		className: 'bg-green-50 text-green-700 border-green-200',
		icon: CheckCircle,
		label: 'Paid',
	},
	PENDING: {
		className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
		icon: Clock,
		label: 'Pending',
	},
	PARTIAL: {
		className: 'bg-blue-50 text-blue-700 border-blue-200',
		icon: Clock,
		label: 'Partial',
	},
	OVERDUE: {
		className: 'bg-red-50 text-red-700 border-red-200',
		icon: AlertCircle,
		label: 'Overdue',
	},
	WAIVED: {
		className: 'bg-gray-50 text-gray-700 border-gray-200',
		icon: CheckCircle,
		label: 'Waived',
	},
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
	status,
	className = '',
}) => {
	const config = statusConfigs[status] || statusConfigs.PENDING
	const Icon = config.icon

	return (
		<Badge
			className={`${config.className} ${className} border font-medium`}
			variant="outline"
		>
			<Icon className="w-3 h-3 mr-1" />
			{config.label}
		</Badge>
	)
}
