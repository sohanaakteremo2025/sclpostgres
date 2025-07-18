import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'
import { AcademicSession } from '@/lib/zod'

export const sessionsColumns = createColumns<AcademicSession>({
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

	startDate: {
		type: 'date',
		header: 'Start Date',
		format: date => formatDate(date),
		icon: Calendar,
	},
	endDate: {
		type: 'date',
		header: 'End Date',
		format: date => formatDate(date),
		icon: Calendar,
	},
	status: {
		type: 'badge',
		header: 'Status',
		variant: 'outline',
	},
	actions: {
		type: 'actions',
		actions: ['update', 'delete'],
	},
})
