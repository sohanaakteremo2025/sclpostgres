import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'

export const classRoutinesColumns = createColumns<any>({
	dayOfWeek: {
		type: 'text',
		header: 'Day of Week',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search day of week...',
			type: 'text',
		},
	},
	startTime: {
		type: 'custom',
		header: 'Start Time',
		className: 'text-center font-semibold',
		enableFilter: false,
		render: value => <div>{value || 'N/A'}</div>,
	},
	endTime: {
		type: 'custom',
		header: 'End Time',
		className: 'text-center font-semibold',
		enableFilter: false,
		render: value => <div>{value || 'N/A'}</div>,
	},
	room: {
		type: 'custom',
		header: 'Room',
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
	'teacher.name': {
		type: 'custom',
		header: 'Teacher',
		className: 'text-center font-semibold',
		sortable: true,
		render: value => <div>{value || 'N/A'}</div>,
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
