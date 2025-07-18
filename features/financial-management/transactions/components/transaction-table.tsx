'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { tenantTransactionColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import {
	deleteManyTransactions,
	deleteTransaction,
} from '../api/transaction.action'
import { Button } from '@/components/ui/button'
import {
	Archive,
	Building2,
	Download,
	Edit,
	PlusCircle,
	Trash2,
} from 'lucide-react'
import { TenantTransaction } from '@/lib/zod'
import TenantForm from './tenant-transaction-form'

interface TenantTransactionTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function TenantTransactionTable({
	dataPromise,
}: TenantTransactionTableProps) {
	return (
		<CardWrapper
			title="School Transactions"
			icon={<Building2 className="h-5 w-5" />}
			description="Manage your transactions"
		>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={tenantTransactionColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				{/* Create Dialog */}
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Transaction
						</Button>
					}
				>
					{({ onSuccess }) => <TenantForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>

				{/* Update Dialog */}
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<TenantForm
							onSuccess={onSuccess}
							item={item as TenantTransaction}
						/>
					)}
				</PrismaDataTable.UpdateDialog>

				{/* Delete Dialog */}
				<PrismaDataTable.DeleteDialog
					title="Delete Tenant"
					getDescription={(item: TenantTransaction) =>
						`Are you sure you want to delete "${item.label}"? `
					}
					onDelete={async item => {
						await deleteTransaction(item.id)
					}}
				/>

				{/* Action Bar Actions - No wrapper needed! */}
				<PrismaDataTable.ActionBarAction
					tooltip="Delete selected transactions"
					onAction={async ({ selectedRows, selectedCount, table }) => {
						await deleteManyTransactions(selectedRows.map(row => row.id))
						table.toggleAllRowsSelected(false)
					}}
				>
					{({ selectedCount }) => (
						<>
							<Trash2 className="h-4 w-4" />
							Delete ({selectedCount})
						</>
					)}
				</PrismaDataTable.ActionBarAction>
			</PrismaDataTable>
		</CardWrapper>
	)
}
