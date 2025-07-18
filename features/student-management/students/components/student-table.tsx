// app/students/_components/students-table.tsx
'use client'
import * as React from 'react'
import { PrismaDataTable } from '@/components/prisma-data-table'
import type { QueryResult } from '@/components/prisma-data-table'
import { studentsColumns } from './columns'
import { deleteStudent } from '../api/student.action'
import CardWrapper from '@/components/card-wrapper'
import { GraduationCap, PlusCircle } from 'lucide-react'
import { Student } from '@/lib/zod'
import StudentForm from './student-form'
import { Button } from '@/components/ui/button'
import { useClasses } from '@/hooks/queries/all-quries'
import Loading from '@/app/institution/loading'
import AdmissionReceipt from './admission-invoice'

interface StudentsTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export function StudentsTable({ dataPromise }: StudentsTableProps) {
	const { data: classes, isLoading } = useClasses()

	if (isLoading) {
		return (
			<div>
				<Loading />
			</div>
		)
	}
	return (
		<CardWrapper
			title="Students"
			description="Manage your students"
			icon={<GraduationCap className="h-5 w-5" />}
		>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={studentsColumns({ classes })}
				pinnedColumns={{ right: ['actions'] }}
			>
				{/* Create Dialog */}
				<PrismaDataTable.CreateDialog
					title="New Student"
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> New Admission
						</Button>
					}
				>
					{({ onSuccess }) => <StudentForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>

				{/* Update Dialog */}
				<PrismaDataTable.UpdateDialog title="Update Student">
					{({ item, onSuccess }) => (
						<StudentForm onSuccess={onSuccess} item={item as Student} />
					)}
				</PrismaDataTable.UpdateDialog>

				{/* Receipt Dialog */}
				<PrismaDataTable.CustomDialog title="Receipt" variant="receipt">
					{({ item }) => {
						console.log(item)
						return <AdmissionReceipt student={item as any} />
					}}
				</PrismaDataTable.CustomDialog>

				{/* Delete Dialog */}
				<PrismaDataTable.DeleteDialog
					title="Delete Student"
					getDescription={(item: Student) =>
						`Are you sure you want to delete "${item.name}"? `
					}
					onDelete={async item => {
						await deleteStudent(item.id)
					}}
				/>
			</PrismaDataTable>
		</CardWrapper>
	)
}
