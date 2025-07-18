import { createColumns } from '@/components/prisma-data-table'
import { formatTimeForDisplay } from '@/utils/time-fomatter'

export const examScheduleColumns = createColumns<any>({
	'subject.name': {
		type: 'custom',
		header: 'Subject',
		className: 'text-center font-semibold',
		enableFilter: false,
		sortable: false,
		render: value => <div>{value || 'N/A'}</div>,
	},
	'exam.title': {
		type: 'custom',
		header: 'Exam',
		className: 'text-center font-semibold',
		enableFilter: false,
		sortable: false,
		render: value => <div>{value || 'N/A'}</div>,
	},
	'class.name': {
		type: 'text',
		header: 'Class',
		className: 'text-center font-semibold',
		sortable: false,
	},
	'section.name': {
		type: 'custom',
		header: 'Section',
		className: 'text-center font-semibold',
		sortable: false,
		render: value => <div>{value || 'All Section'}</div>,
	},
	date: {
		type: 'date',
		header: 'Date',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search date...',
			type: 'dateRange',
		},
	},
	startTime: {
		type: 'custom',
		header: 'Start Time',
		className: 'text-center font-semibold',
		enableFilter: false,
		render: value => <div>{formatTimeForDisplay(value, '12') || 'N/A'}</div>,
	},
	endTime: {
		type: 'custom',
		header: 'End Time',
		className: 'text-center font-semibold',
		enableFilter: false,
		render: value => <div>{formatTimeForDisplay(value, '12') || 'N/A'}</div>,
	},
	room: {
		type: 'custom',
		header: 'Room',
		className: 'text-center font-semibold',
		enableFilter: false,
		render: value => <div>{value || 'N/A'}</div>,
	},
	actions: {
		type: 'actions',
		actions: ['update', 'delete'],
	},
})
