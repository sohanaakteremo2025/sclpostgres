'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { classRoutinesColumns } from './columns'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import ClassRoutineForm from './classRoutine-form'
import {
	deleteClassRoutine,
	updateClassRoutine,
} from '../api/classRoutine.action'
import { ClassRoutine } from '@/lib/zod'

interface ClassRoutineTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function ClassRoutineTable({
	dataPromise,
}: ClassRoutineTableProps) {
	return (
		<div>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={classRoutinesColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Class Routine
						</Button>
					}
				>
					{({ onSuccess }) => <ClassRoutineForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<ClassRoutineForm
							onSuccess={onSuccess}
							item={item as ClassRoutine}
						/>
					)}
				</PrismaDataTable.UpdateDialog>
				<PrismaDataTable.DeleteDialog
					title="Delete Class Routine"
					getDescription={(item: ClassRoutine) =>
						`Are you sure you want to delete "${item.dayOfWeek}"?`
					}
					onDelete={async item => {
						await deleteClassRoutine(item.id)
					}}
				/>
			</PrismaDataTable>
		</div>
	)
}
