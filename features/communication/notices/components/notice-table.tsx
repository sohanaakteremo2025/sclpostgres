'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { noticesColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import { deleteNotice } from '../api/notice.action'
import { Button } from '@/components/ui/button'
import { Building2, PlusCircle } from 'lucide-react'
import { Notice } from '@/lib/zod'
import NoticeForm from '../components/notice-form'

interface NoticeTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function NoticeTable({ dataPromise }: NoticeTableProps) {
	return (
		<PrismaDataTable
			dataPromise={dataPromise}
			columns={noticesColumns}
			pinnedColumns={{ right: ['actions'] }}
		>
			{/* Create Dialog */}
			<PrismaDataTable.CreateDialog
				trigger={
					<Button>
						<PlusCircle className="h-4 w-4" /> Create Notice
					</Button>
				}
			>
				{({ onSuccess }) => <NoticeForm onSuccess={onSuccess} />}
			</PrismaDataTable.CreateDialog>

			{/* Update Dialog */}
			<PrismaDataTable.UpdateDialog>
				{({ item, onSuccess }) => (
					<NoticeForm onSuccess={onSuccess} item={item as Notice} />
				)}
			</PrismaDataTable.UpdateDialog>

			{/* Delete Dialog */}
			<PrismaDataTable.DeleteDialog
				title="Delete Notice"
				getDescription={(item: Notice) =>
					`Are you sure you want to delete "${item.title}"? `
				}
				onDelete={async item => {
					await deleteNotice(item.id)
				}}
			/>
		</PrismaDataTable>
	)
}
