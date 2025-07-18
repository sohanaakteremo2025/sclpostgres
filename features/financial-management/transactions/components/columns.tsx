import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar } from 'lucide-react'
import { TenantTransaction, TransactionTypeSchema } from '@/lib/zod'
import { formatCurrency } from '@/utils/currency-formatter'
import { Badge } from '@/components/ui/badge'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'

export const tenantTransactionColumns = createColumns<TenantTransaction>({
	id: {
		type: 'select',
		header: 'ID',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		sortable: false,
	},
	label: {
		type: 'text',
		header: 'Label',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		sortable: false,
		filter: {
			placeholder: 'Search names...',
			type: 'text',
		},
	},

	amount: {
		type: 'custom',
		header: 'Amount',
		className: 'max-w-[200px] truncate font-medium',
		render: value => formatCurrency(value, { currency: 'BDT' }),
	},

	type: {
		type: 'custom',
		header: 'Type',
		className: 'max-w-[200px] truncate font-medium',
		render: value => (
			<Badge
				variant={
					value === 'INCOME'
						? 'success'
						: value === 'EXPENSE'
							? 'destructive'
							: 'warning'
				}
			>
				{value}
			</Badge>
		),
		enableFilter: true,
		filter: {
			type: 'multiSelect',
			options: enumToOptions(TransactionTypeSchema.enum),
		},
	},

	note: {
		type: 'text',
		header: 'Note',
		className: 'max-w-[200px] truncate font-medium',
		sortable: false,
	},

	transactionBy: {
		type: 'text',
		header: 'Transaction By',
		className: 'max-w-[200px] truncate font-medium',
	},

	createdAt: {
		type: 'date',
		header: 'Created',
		format: date => formatDate(date),
		icon: Calendar,
		enableFilter: true,
		filter: {
			type: 'dateRange',
		},
	},

	actions: {
		type: 'actions',
		actions: ['update', 'delete'],
	},
})
