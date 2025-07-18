'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { sessionsColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import { deleteSession } from '../api/session.action'
import { Button } from '@/components/ui/button'
import { Building2, PlusCircle } from 'lucide-react'
import { AcademicSession } from '@/lib/zod'
import SessionForm from '../components/session-form'

interface SessionTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function SessionTable({ dataPromise }: SessionTableProps) {
	return (
		<CardWrapper
			title="Sessions"
			icon={<Building2 className="h-5 w-5" />}
			description="Manage your sessions"
		>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={sessionsColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				{/* Create Dialog */}
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Session
						</Button>
					}
				>
					{({ onSuccess }) => <SessionForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>

				{/* Update Dialog */}
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<SessionForm onSuccess={onSuccess} item={item as AcademicSession} />
					)}
				</PrismaDataTable.UpdateDialog>

				{/* Delete Dialog */}
				<PrismaDataTable.DeleteDialog
					title="Delete Session"
					getDescription={(item: AcademicSession) =>
						`Are you sure you want to delete "${item.title}"? `
					}
					onDelete={async item => {
						await deleteSession(item.id)
					}}
				/>
			</PrismaDataTable>
		</CardWrapper>
	)
}
