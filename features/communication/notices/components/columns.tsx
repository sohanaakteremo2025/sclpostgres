import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'
import { Notice } from '@/lib/zod'

export const noticesColumns = createColumns<Notice>({
	title: {
		type: 'text',
		header: 'Title',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search titles...',
			type: 'text',
		},
	},
	content: {
		type: 'text',
		header: 'Content',
		className: 'max-w-[200px] truncate font-medium',
	},

	createdAt: {
		type: 'date',
		header: 'Created At',
		format: date => formatDate(date),
		icon: Calendar,
	},
	actions: {
		type: 'actions',
		actions: ['update', 'delete'],
	},
})
