'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { tenantsColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import { deleteTenant } from '../api/tenant.action'
import { Button } from '@/components/ui/button'
import { Building2, PlusCircle } from 'lucide-react'
import { Tenant } from '@/lib/zod'
import TenantForm from './tenant-form'

interface TenantTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function TenantTable({ dataPromise }: TenantTableProps) {
	return (
		<CardWrapper
			title="Tenants"
			icon={<Building2 className="h-5 w-5" />}
			description="Manage your tenants"
		>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={tenantsColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				{/* Create Dialog */}
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Tenant
						</Button>
					}
				>
					{({ onSuccess }) => <TenantForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>

				{/* Update Dialog */}
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<TenantForm onSuccess={onSuccess} item={item} />
					)}
				</PrismaDataTable.UpdateDialog>

				{/* Delete Dialog */}
				<PrismaDataTable.DeleteDialog
					title="Delete Tenant"
					getDescription={(item: Tenant) =>
						`Are you sure you want to delete "${item.name}"? `
					}
					onDelete={async item => {
						await deleteTenant(item.id)
					}}
				/>
			</PrismaDataTable>
		</CardWrapper>
	)
}
