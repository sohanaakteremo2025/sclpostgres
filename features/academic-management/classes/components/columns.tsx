import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const classesColumns = createColumns<any>({
	name: {
		type: 'text',
		header: 'Name',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search names...',
			type: 'text',
		},
	},

	sections: {
		type: 'custom',
		header: 'Group/Sections',
		render: value => (
			<div className="flex flex-wrap gap-2">
				{value.map((section: { name: string }) => (
					<Badge variant="outline" key={section.name}>
						{section.name}
					</Badge>
				))}
			</div>
		),
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
