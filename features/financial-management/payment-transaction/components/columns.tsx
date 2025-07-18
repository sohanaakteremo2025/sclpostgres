'use client'
import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar, IdCard, Printer, Timer, User } from 'lucide-react'
import { formatCurrency } from '@/utils/currency-formatter'

export const paymentTransactionColumns = createColumns<any>({
	studentId: {
		type: 'custom',
		header: 'Student info',
		className: 'max-w-[250px] truncate font-medium',
		sortable: false,
		render: (_, row) => (
			<div className="flex items-center gap-2">
				<IdCard className="h-5 w-5" />
				<span>
					{row.student.name} - {row.student.class.name} - (
					{row.student.section.name}) - (Roll: {row.student.roll})
				</span>
			</div>
		),
	},
	totalAmount: {
		type: 'custom',
		header: 'Total Amount',
		className: 'max-w-[200px] truncate font-medium',
		render: value => formatCurrency(value, { currency: 'BDT' }),
	},
	transactionDate: {
		type: 'date',
		header: 'Transaction Date',
		format: date =>
			new Date(date).toLocaleDateString('en-BD', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			}),
		icon: Calendar,
		enableFilter: true,
		filter: {
			type: 'dateRange',
		},
	},
	collectedBy: {
		type: 'text',
		header: 'Collected By',
		icon: User,
		className: 'max-w-[200px] truncate font-medium',
	},
	printCount: {
		type: 'text',
		header: 'Print Count',
		icon: Timer,
		className: 'max-w-[200px] truncate font-medium',
	},
	actions: {
		type: 'actions',
		actions: ['studentCopy', 'adminCopy'],
		actionConfig: {
			studentCopy: {
				icon: Printer,
				label: 'Student Copy',
			},
			adminCopy: {
				icon: Printer,
				label: 'Admin Copy',
			},
		},
	},
})
