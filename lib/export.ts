import { type Table } from '@tanstack/react-table'
import { toast } from 'sonner'

export function exportTableToCSV<TData>(
	/**
	 * The table to export.
	 * @type Table<TData>
	 */
	table: Table<TData>,
	opts: {
		/**
		 * The filename for the CSV file.
		 * @default "table"
		 * @example "tasks"
		 */
		filename?: string
		/**
		 * The columns to exclude from the CSV file.
		 * @default []
		 * @example ["select", "actions"]
		 */
		excludeColumns?: (keyof TData | string)[]

		/**
		 * Whether to export only the selected rows.
		 * @default false
		 */
		onlySelected?: boolean
	} = {},
): void {
	const { filename = 'table', excludeColumns = [], onlySelected = false } = opts
	//check if table is empty
	if (table.getRowModel().rows.length === 0) {
		toast.error('Table is empty')
		return
	}

	// Retrieve headers (column names)
	const headers = table
		.getAllLeafColumns()
		.map(column => column.id)
		.filter(id => !excludeColumns.includes(id))

	// Build CSV content
	const csvContent = [
		headers.join(','),
		...(onlySelected
			? table.getFilteredSelectedRowModel().rows
			: table.getRowModel().rows
		).map(row =>
			headers
				.map(header => {
					const cellValue = row.getValue(header)
					// Handle values that might contain commas or newlines
					return typeof cellValue === 'string'
						? `"${cellValue.replace(/"/g, '""')}"`
						: cellValue
				})
				.join(','),
		),
	].join('\n')

	// Create a Blob with CSV content
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

	// Create a link and trigger the download
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.setAttribute('href', url)
	link.setAttribute('download', `${filename}.csv`)
	link.style.visibility = 'hidden'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}
