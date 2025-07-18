import { createColumns } from '@/components/prisma-data-table'

export const userColumns = createColumns<any>({
	photo: {
		type: 'image',
		header: 'Photo',
		sortable: false,
	},
	name: {
		type: 'text',
		header: 'Name',
		className: 'max-w-[200px] truncate font-medium',
		sortable: false,
		enableFilter: true,
		filter: {
			placeholder: 'Search names...',
			type: 'text',
		},
	},

	email: {
		type: 'text',
		header: 'Email',
		className: 'max-w-[200px] truncate text-muted-foreground',
		sortable: false,
	},

	tenant: {
		type: 'custom',
		header: 'Domain',
		className: 'max-w-[200px] truncate text-muted-foreground',
		sortable: false,
		render: (value, row) => row.tenant?.domain,
	},

	role: {
		type: 'badge',
		header: 'Role',
		variant: 'outline',
		sortable: false,
	},
	actions: {
		type: 'actions',
		actions: ['update', 'delete'],
	},
})
