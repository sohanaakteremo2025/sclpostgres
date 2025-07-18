'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/column-header'
import { RowActions } from './row-actions'
import { UserAvatar } from '@/components/user-avatar'
import { currencySimbols } from '@/constants/constants'
import { Badge } from '@/components/ui/badge'
interface FlatStudent {
	id: string
	fullName: string
	dateOfBirth?: string
	gender: string
	phone: string
	address: string
	email: string
	photo: string
	studentId: string
	religion: string
	monthlyFee: number
	classId: string
	sectionId: string
	guardianName: string
	relationship: string
	guardianPhone: string
	guardianEmail: string
	guardianOccupation: string
	fatherName: string
	motherName: string
	class: string
	section: string
	unpaidMonths: string[]
}

export const columns: ColumnDef<FlatStudent>[] = [
	{
		accessorKey: 'photo',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Photo" />
		),
		cell: ({ row }) => (
			<UserAvatar
				firstName={row.original.fullName}
				src={row.getValue('photo')}
			/>
		),
	},
	{
		accessorKey: 'fullName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Full Name" />
		),
		cell: ({ row }) => (
			<div className="w-[150px] capitalize">{row.getValue('fullName')}</div>
		),
	},
	{
		accessorKey: 'studentId',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Student ID" />
		),
		cell: ({ row }) => (
			<div className="w-[120px] font-medium">{row.getValue('studentId')}</div>
		),
	},
	{
		accessorKey: 'class',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Class Info" />
		),
		cell: ({ row }) => <div className="w-[100px]">{row.getValue('class')}</div>,
	},
	{
		accessorKey: 'section',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Section" />
		),
		cell: ({ row }) => (
			<div className="w-[100px]">{row.getValue('section')}</div>
		),
	},
	{
		accessorKey: 'unpaidMonths',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Dues Months" />
		),
		cell: ({ row }) =>{
			const unpaid = row.getValue('unpaidMonths') as string[]
			return (
			<div className="w-[150px]">
				<Badge variant={unpaid.length > 0? 'success' 'destructive'}>{unpaid.length > 0 ? unpaid: 'Paid'}</Badge>
			</div>
		)},
	},
	{
		accessorKey: 'monthlyFee',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Monthly Fee" />
		),
		cell: ({ row }) => (
			<div className="w-[150px]">
				{currencySimbols['BDT']} {row.getValue('monthlyFee')}
			</div>
		),
	},
	
	{
		accessorKey: 'phone',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Phone Number" />
		),
		cell: ({ row }) => <div className="w-[150px]">{row.getValue('phone')}</div>,
	},
	{
		accessorKey: 'email',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
		cell: ({ row }) => <div className="w-[170px]">{row.getValue('email')}</div>,
	},

	{
		accessorKey: 'religion',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Religion" />
		),
		cell: ({ row }) => (
			<div className="w-[100px] capitalize">{row.getValue('religion')}</div>
		),
	},
	{
		accessorKey: 'gender',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Gender" />
		),
		cell: ({ row }) => (
			<div className="w-[80px] capitalize">{row.getValue('gender')}</div>
		),
	},
	{
		accessorKey: 'dateOfBirth',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Date of Birth" />
		),
		cell: ({ row }) => (
			<div className="w-[150px]">
				{new Date(row.getValue('dateOfBirth')).toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				})}
			</div>
		),
	},
	{
		accessorKey: 'address',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Address" />
		),
		cell: ({ row }) => (
			<div className="w-[150px]">{row.getValue('address')}</div>
		),
	},
	//guardian relationship
	{
		accessorKey: 'relationship',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Guardian Relation" />
		),
		cell: ({ row }) => (
			<div className="w-[100px]">{row.getValue('relationship')}</div>
		),
	},
	{
		accessorKey: 'guardianName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Guardian Name" />
		),
		cell: ({ row }) => (
			<div className="w-[150px]">{row.getValue('guardianName')}</div>
		),
	},
	{
		accessorKey: 'guardianPhone',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Guardian Phone" />
		),
		cell: ({ row }) => (
			<div className="w-[150px]">{row.getValue('guardianPhone')}</div>
		),
	},

	{
		accessorKey: 'fatherName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Father's Name" />
		),
		cell: ({ row }) => (
			<div className="w-[150px] capitalize">{row.getValue('fatherName')}</div>
		),
	},

	{
		accessorKey: 'motherName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Mother's Name" />
		),
		cell: ({ row }) => (
			<div className="w-[150px] capitalize">{row.getValue('motherName')}</div>
		),
	},
	{
		id: 'actions',
		cell: ({ row }) => <RowActions row={row} />,
	},
]
