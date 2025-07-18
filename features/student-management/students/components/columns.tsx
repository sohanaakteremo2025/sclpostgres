'use client'
import { createColumns } from '@/components/prisma-data-table'
import { formatDate } from '@/lib/format'
import { Calendar, Mail, PenBox, Printer, Trash, User } from 'lucide-react'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { StudentStatus } from '@prisma/client'
import { UserAvatar } from '@/components/user-avatar'

export const studentsColumns = ({ classes }: { classes: any }) => {
	const columns = createColumns<any>({
		photo: {
			type: 'custom',
			header: 'Photo',
			icon: User,
			className: 'max-w-[200px] truncate font-medium',
			render: (value, row) => (
				<UserAvatar src={row.photo} firstName={row.name} />
			),
		},
		name: {
			type: 'text',
			header: 'Name',
			icon: User,
			className: 'max-w-[200px] truncate font-medium',
			enableFilter: true,
			filter: {
				placeholder: 'Search names...',
				type: 'text',
			},
		},

		roll: {
			type: 'text',
			header: 'Roll',
			sortable: true,
		},
		studentId: {
			type: 'text',
			className: 'max-w-[200px] w-[120px] truncate font-medium',
			header: 'Student ID',
			sortable: true,
		},

		// Use classId for filtering but display class.name
		classId: {
			type: 'custom',
			header: 'Class',
			enableFilter: true,
			render: (value, row) => (
				<span>
					{row.class.name} ({row.section.name})
				</span>
			),
			filter: {
				type: 'multiSelect',
				placeholder: 'Filter classes...',
				options: classes,
			},
		},

		status: {
			type: 'badge',
			variant: 'outline',
			header: 'Status',
			enableFilter: true,
			filter: {
				type: 'multiSelect',
				options: enumToOptions(StudentStatus),
			},
		},
		email: {
			type: 'text',
			icon: Mail,
			header: 'Email',
			className: 'max-w-[200px] truncate text-muted-foreground',
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
			actions: ['update', 'receipt', 'delete'],
			actionConfig: {
				update: {
					icon: PenBox,
					label: 'Edit',
				},
				receipt: {
					icon: Printer,
					label: 'Admission Receipt',
				},
				delete: {
					icon: Trash,
					label: 'Delete',
					className: 'text-red-500',
				},
			},
		},
	})
	return columns
}
