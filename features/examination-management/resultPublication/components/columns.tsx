'use client'

import { createColumns } from '@/components/prisma-data-table'

export const resultPublicationColumns = createColumns<any>({
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
})
