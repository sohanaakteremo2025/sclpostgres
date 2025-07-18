'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { feeStructureColumns } from './columns'
import CardWrapper from '@/components/card-wrapper'
import { deleteFeeStructure } from '../api/feestructure.action'
import { Button } from '@/components/ui/button'
import { Building2, PlusCircle } from 'lucide-react'
import { FeeStructure } from '@/lib/zod'
import FeeStructureForm from './feestructure-form'

interface FeeStructureTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function FeeStructureTable({
	dataPromise,
}: FeeStructureTableProps) {
	return (
		<CardWrapper
			title="Fee Structures"
			icon={<Building2 className="h-5 w-5" />}
			description="Manage your fee structures"
		>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={feeStructureColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				{/* Create Dialog */}
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Fee Structure
						</Button>
					}
				>
					{({ onSuccess }) => <FeeStructureForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>

				{/* Update Dialog */}
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<FeeStructureForm
							onSuccess={onSuccess}
							item={item as FeeStructure}
						/>
					)}
				</PrismaDataTable.UpdateDialog>

				{/* Delete Dialog */}
				<PrismaDataTable.DeleteDialog
					title="Delete Fee Structure"
					getDescription={(item: FeeStructure) =>
						`Are you sure you want to delete "${item.title}"? `
					}
					onDelete={async item => {
						await deleteFeeStructure(item.id)
					}}
				/>
			</PrismaDataTable>
		</CardWrapper>
	)
}
