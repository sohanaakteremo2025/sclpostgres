import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'

export const sectionsColumns = createColumns<any>({
	name: {
		type: 'custom',
		header: 'Section/Group Name',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		render: (value, row) => (
			<span>
				{row.name} - ({row.class.name})
			</span>
		),
		filter: {
			placeholder: 'Search section names...',
			type: 'text',
		},
	},
	'students.length': {
		type: 'text',
		header: 'Students',
		className: 'text-center font-semibold',
		enableFilter: false,
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
