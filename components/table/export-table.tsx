import React from 'react'
import { Button } from '../ui/button'
import { exportTableToCSV } from '@/lib/export'
import { Table } from '@tanstack/react-table'
import { DownloadIcon } from 'lucide-react'

interface ExportTableProps<TData> {
	table: Table<TData>
}
export default function ExportTable<TData>({ table }: ExportTableProps<TData>) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() =>
				exportTableToCSV(table, {
					filename: `Table_Data_${new Date()
						.toLocaleDateString('en-US', {
							day: '2-digit',
							month: 'long',
							year: 'numeric',
						})
						.replace(/, | /g, '_')}`,
					excludeColumns: ['actions'],
				})
			}
		>
			<DownloadIcon className="mr-2 size-4" aria-hidden="true" />
			Export
		</Button>
	)
}
