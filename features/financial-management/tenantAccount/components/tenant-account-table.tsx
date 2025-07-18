'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { tenantAccountColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import { deleteTenantAccount } from '../api/tenantAccount.action'
import { Button } from '@/components/ui/button'
import { Building2, PlusCircle } from 'lucide-react'
import { TenantAccount } from '@/lib/zod'
import TenantAccountForm from './tenant-account-form'
import FundTransferForm from './fund-transfer-form'
import FundDepositForm from './fund-deposit-form'
import FundWithdrawalForm from './fund-withdrawal-form'

interface TenantAccountTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function TenantAccountTable({
	dataPromise,
}: TenantAccountTableProps) {
	return (
		<PrismaDataTable
			dataPromise={dataPromise}
			columns={tenantAccountColumns}
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
				{({ onSuccess }) => <TenantAccountForm onSuccess={onSuccess} />}
			</PrismaDataTable.CreateDialog>

			{/* Update Dialog */}
			<PrismaDataTable.UpdateDialog>
				{({ item, onSuccess }) => (
					<TenantAccountForm
						onSuccess={onSuccess}
						item={item as TenantAccount}
					/>
				)}
			</PrismaDataTable.UpdateDialog>

			{/* Delete Dialog */}
			<PrismaDataTable.DeleteDialog
				title="Delete Tenant"
				getDescription={(item: TenantAccount) =>
					`Are you sure you want to delete "${item.title}"? `
				}
				onDelete={async item => {
					await deleteTenantAccount(item.id)
				}}
			/>
			{/* custom dialog */}
			<PrismaDataTable.CustomDialog
				title="Fund Transfer"
				variant="fundTransfer"
				children={({ item, onSuccess }) => (
					<FundTransferForm onSuccess={onSuccess} />
				)}
			/>
			{/* add balance dialog */}
			<PrismaDataTable.CustomDialog
				title="Add Balance"
				variant="deposit"
				children={({ item, onSuccess }) => (
					<FundDepositForm onSuccess={onSuccess} />
				)}
			/>
			{/* withdraw dialog */}
			<PrismaDataTable.CustomDialog
				title="Withdraw"
				variant="withdraw"
				children={({ item, onSuccess }) => (
					<FundWithdrawalForm onSuccess={onSuccess} />
				)}
			/>
		</PrismaDataTable>
	)
}
