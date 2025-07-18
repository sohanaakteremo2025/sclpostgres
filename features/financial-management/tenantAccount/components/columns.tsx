import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import {
	ArrowLeftRight,
	Calendar,
	Minus,
	Pen,
	PenBox,
	Plus,
	SendHorizonal,
	Trash,
} from 'lucide-react'
import { TenantAccount } from '@/lib/zod'
import { formatCurrency } from '@/utils/currency-formatter'
import { createTypedColumns } from '@/components/prisma-data-table/utils/columns-builder'
type TenantAccountActions =
	| 'update'
	| 'delete'
	| 'fundTransfer'
	| 'deposit'
	| 'withdraw'
export const tenantAccountColumns = createTypedColumns<
	TenantAccount,
	TenantAccountActions
>({
	title: {
		type: 'text',
		header: 'Title',
		className: 'max-w-[200px] truncate font-medium',
		enableFilter: true,
		sortable: false,
		filter: {
			placeholder: 'Search names...',
			type: 'text',
		},
	},

	balance: {
		type: 'custom',
		header: 'Balance',
		className: 'max-w-[200px] truncate font-medium',
		render: value => formatCurrency(value, { currency: 'BDT' }),
	},

	createdAt: {
		type: 'date',
		header: 'Created',
		format: date => formatDate(date),
		icon: Calendar,
	},

	actions: {
		type: 'actions',
		actions: ['update', 'fundTransfer', 'deposit', 'withdraw', 'delete'],
		actionConfig: {
			fundTransfer: {
				label: 'Fund Transfer',
				icon: ArrowLeftRight,
			},
			deposit: {
				label: 'Deposit',
				icon: Plus,
			},
			withdraw: {
				label: 'Withdraw',
				icon: Minus,
			},
			update: {
				label: 'Edit',
				icon: PenBox,
			},
			delete: {
				label: 'Delete',
				icon: Trash,
			},
		},
	},
})
