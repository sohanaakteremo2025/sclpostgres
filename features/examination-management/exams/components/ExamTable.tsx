'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { examColumns } from './ExamColumns'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { ExamForm } from './ExamForm'
import { deleteExam, updateExam } from '../api/exam'
import { Exam } from '@/lib/zod'

interface ExamTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function ExamTable({ dataPromise }: ExamTableProps) {
	return (
		<div>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={examColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Exam
						</Button>
					}
				>
					{({ onSuccess }) => <ExamForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<ExamForm onSuccess={onSuccess} item={item as Exam} />
					)}
				</PrismaDataTable.UpdateDialog>
				<PrismaDataTable.DeleteDialog
					title="Delete Exam"
					getDescription={(item: Exam) =>
						`Are you sure you want to delete "${item.title}"?`
					}
					onDelete={async item => {
						await deleteExam(item.id)
					}}
				/>
			</PrismaDataTable>
		</div>
	)
}
