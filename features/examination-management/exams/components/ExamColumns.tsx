import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'

export const examColumns = createColumns<any>({
	title: {
		type: 'text',
		header: 'Title',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search date...',
			type: 'text',
		},
	},
	startDate: {
		type: 'date',
		header: 'Start Date',
		render: value => formatDate(value),
	},
	endDate: {
		type: 'date',
		header: 'End Date',
		render: value => formatDate(value),
	},
	examType: {
		type: 'custom',
		header: 'Exam Type',
		enableFilter: false,
		sortable: false,
		render: value => (
			<span>
				{value.name} ({value.weight}%)
			</span>
		),
	},
	'session.title': {
		type: 'text',
		header: 'Session',
		enableFilter: false,
		sortable: false,
	},
	actions: {
		type: 'actions',
		actions: ['update', 'delete'],
	},
})
