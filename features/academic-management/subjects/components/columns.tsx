import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'

export const subjectsColumns = createColumns<any>({
	name: {
		type: 'text',
		header: 'Subject Name',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search subject names...',
			type: 'text',
		},
	},
	type: {
		type: 'custom',
		header: 'Type',
		className: 'text-center font-semibold',
		enableFilter: false,
		render: value => <div>{value || 'N/A'}</div>,
	},
	code: {
		type: 'custom',
		header: 'Code',
		className: 'text-center font-semibold',
		enableFilter: false,
		render: value => <div>{value || 'N/A'}</div>,
	},
	'class.name': {
		type: 'text',
		header: 'Class',
		className: 'text-center font-semibold',
		filter: {
			placeholder: 'Search class names...',
			type: 'text',
		},
		sortable: true,
	},
	'section.name': {
		type: 'custom',
		header: 'Section',
		className: 'text-center font-semibold',
		sortable: true,
		render: value => <div>{value || 'All Section'}</div>,
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
