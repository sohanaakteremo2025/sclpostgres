'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { subjectsColumns } from './columns'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import SubjectForm from './subject-form'
import { deleteSubject, updateSubject } from '../api/subject.action'
import { Subject } from '@/lib/zod'

interface SubjectTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function SubjectTable({ dataPromise }: SubjectTableProps) {
	return (
		<div>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={subjectsColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Section
						</Button>
					}
				>
					{({ onSuccess }) => <SubjectForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<SubjectForm onSuccess={onSuccess} item={item as Subject} />
					)}
				</PrismaDataTable.UpdateDialog>
				<PrismaDataTable.DeleteDialog
					title="Delete Subject"
					getDescription={(item: Subject) =>
						`Are you sure you want to delete "${item.name}"?`
					}
					onDelete={async item => {
						await deleteSubject(item.id)
					}}
				/>
			</PrismaDataTable>
		</div>
	)
}
