'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { classesColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import { deleteClass } from '../api/class.action'
import { Button } from '@/components/ui/button'
import { Building2, PlusCircle } from 'lucide-react'
import { Class } from '@/lib/zod'
import ClassForm from './class-form'

interface ClassTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function ClassTable({ dataPromise }: ClassTableProps) {
	return (
		<CardWrapper
			title="Classes"
			icon={<Building2 className="h-5 w-5" />}
			description="Manage your classes"
		>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={classesColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				{/* Create Dialog */}
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Class
						</Button>
					}
				>
					{({ onSuccess }) => <ClassForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>

				{/* Update Dialog */}
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<ClassForm onSuccess={onSuccess} item={item as Class} />
					)}
				</PrismaDataTable.UpdateDialog>

				{/* Delete Dialog */}
				<PrismaDataTable.DeleteDialog
					title="Delete Class"
					getDescription={(item: Class) =>
						`Are you sure you want to delete "${item.name}"? `
					}
					onDelete={async item => {
						await deleteClass(item.id)
					}}
				/>
			</PrismaDataTable>
		</CardWrapper>
	)
}
