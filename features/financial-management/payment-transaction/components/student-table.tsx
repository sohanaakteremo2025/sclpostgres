// app/students/_components/students-table.tsx
'use client'
import * as React from 'react'
import { PrismaDataTable } from '@/components/prisma-data-table'
import type { QueryResult } from '@/components/prisma-data-table'
import { paymentTransactionColumns } from './columns'
import { PrintableInvoice } from './PrintableInvoice'
import { incrementPrintCount } from '../api/studentPayment.action'

interface PaymentTransactionTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export function PaymentTransactionTable({
	dataPromise,
}: PaymentTransactionTableProps) {
	const handlePrintSuccess = async (transactionId: string) => {
		await incrementPrintCount(transactionId)
	}
	return (
		<PrismaDataTable
			dataPromise={dataPromise}
			columns={paymentTransactionColumns}
			pinnedColumns={{ right: ['actions'] }}
		>
			{/* print dialog */}
			<PrismaDataTable.CustomDialog
				variant="studentCopy"
				title="Print Payment Invoice"
				children={({ item }) => (
					<div>
						<PrintableInvoice
							transaction={item as any}
							copyType="Student Copy"
							onPrintSuccess={handlePrintSuccess}
						/>
					</div>
				)}
			/>
			<PrismaDataTable.CustomDialog
				variant="adminCopy"
				title="Print Payment Invoice"
				children={({ item }) => (
					<div>
						<PrintableInvoice
							showPrintButton={false}
							transaction={item as any}
							copyType="Admin Copy"
							onPrintSuccess={handlePrintSuccess}
						/>
					</div>
				)}
			/>
			<PrismaDataTable.CustomDialog
				variant="bothCopies"
				title="Print Payment Invoice"
				children={({ item }) => (
					<div>
						<PrintableInvoice
							transaction={item as any}
							onPrintSuccess={handlePrintSuccess}
							printBothCopies={true}
						/>
					</div>
				)}
			/>
		</PrismaDataTable>
	)
}
