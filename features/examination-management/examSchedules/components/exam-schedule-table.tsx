'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { examScheduleColumns } from './columns'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import ExamScheduleForm from './exam-schedule-form'
import { ExamSchedule } from '@/lib/zod'
import { deleteExamSchedule } from '../api/examSchedule.action'
import { toast } from 'sonner'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'

interface ExamScheduleTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function ExamScheduleTable({
	dataPromise,
}: ExamScheduleTableProps) {
	return (
		<div>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={examScheduleColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Exam Schedule
						</Button>
					}
				>
					{({ onSuccess }) => <ExamScheduleForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<ExamScheduleForm onSuccess={onSuccess} item={item as any} />
					)}
				</PrismaDataTable.UpdateDialog>
				<PrismaDataTable.DeleteDialog
					title="Delete Exam Schedule"
					getDescription={(item: ExamSchedule) =>
						`Are you sure you want to delete schedule?`
					}
					onDelete={async item => {
						try {
							await deleteExamSchedule(item.id)
						} catch (error: any) {
							toast.error(
								'Failed to delete exam schedule ' + cleanErrorMessage(error),
							)
						}
					}}
				/>
			</PrismaDataTable>
		</div>
	)
}
