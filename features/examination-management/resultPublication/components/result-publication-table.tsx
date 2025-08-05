'use client'

import { PrismaDataTable } from '@/components/prisma-data-table'
import { resultPublicationColumns } from './columns'

interface ResultPublicationTableProps {
	dataPromise: Promise<any>
}

export function ResultPublicationTable({
	dataPromise,
}: ResultPublicationTableProps) {
	return (
		<PrismaDataTable
			dataPromise={dataPromise}
			columns={resultPublicationColumns}
			pinnedColumns={{ right: ['actions'] }}
		>
			{/* <PrismaDataTable.CreateDialog trigger={undefined}>
				{({ onSuccess }) => <ResultPublicationForm onSuccess={onSuccess} />}
			</PrismaDataTable.CreateDialog> */}

			{/* <PrismaDataTable.UpdateDialog>
				{({ item, onSuccess }) => (
					<ResultPublicationForm onSuccess={onSuccess} item={item} />
				)}
			</PrismaDataTable.UpdateDialog> */}

			{/* <PrismaDataTable.DeleteDialog
				title="Delete Result Publication"
				getDescription={(item) =>
					`Are you sure you want to delete the result publication for "${item.examSchedule?.exam?.title || 'this exam'}"? This action cannot be undone.`
				}
				onDelete={async (item) => {
					const result = await deleteResultPublication(item.id)
					if (!result.success) {
						throw new Error(result.error)
					}
					return result
				}}
			/> */}
		</PrismaDataTable>
	)
}
