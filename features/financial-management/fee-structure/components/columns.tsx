import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'
import { FeeStructure } from '@/lib/zod'

export const feeStructureColumns = createColumns<FeeStructure>({
	title: {
		type: 'text',
		header: 'Title',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search names...',
			type: 'text',
		},
	},

	createdAt: {
		type: 'date',
		header: 'Created',
		format: date => formatDate(date),
		icon: Calendar,
	},
	actions: {
		type: 'actions',
		actions: ['update', 'delete'],
	},
})
