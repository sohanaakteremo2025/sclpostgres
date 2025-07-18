'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { userColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import { deleteUser } from '../api/user.actions'
import { Button } from '@/components/ui/button'
import { PlusCircle, Users } from 'lucide-react'
import { User } from '@/lib/zod'
import UserForm from './user-form'

interface UserTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function UsersTable({ dataPromise }: UserTableProps) {
	return (
		<CardWrapper
			title="Users"
			icon={<Users className="h-5 w-5" />}
			description="Manage your users"
		>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={userColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				{/* Create Dialog */}
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create User
						</Button>
					}
				>
					{({ onSuccess }) => <UserForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>

				{/* Update Dialog */}
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<UserForm onSuccess={onSuccess} item={item as User} />
					)}
				</PrismaDataTable.UpdateDialog>

				{/* Delete Dialog */}
				<PrismaDataTable.DeleteDialog
					title="Delete User"
					getDescription={(item: User) =>
						`Are you sure you want to delete "${item.name}"? `
					}
					onDelete={async item => {
						await deleteUser(item.id)
					}}
				/>
			</PrismaDataTable>
		</CardWrapper>
	)
}
