import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tenant } from '@/lib/zod'

export const tenantsColumns = createColumns<Tenant>({
	logo: {
		type: 'image',
		header: 'Logo',
		className: 'max-w-[200px] truncate font-medium',
	},

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

	email: {
		type: 'text',
		header: 'Email',
		className: 'max-w-[200px] truncate font-medium',
	},

	phone: {
		type: 'text',
		header: 'Phone',
		className: 'max-w-[200px] truncate font-medium',
	},

	address: {
		type: 'text',
		header: 'Address',
		className: 'max-w-[200px] truncate font-medium',
	},

	domain: {
		type: 'text',
		header: 'Domain',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		filter: {
			placeholder: 'Search domains...',
			type: 'text',
		},
	},

	status: {
		type: 'badge',
		variant: 'outline',
		header: 'Status',
		className: 'max-w-[200px] truncate font-medium',
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
