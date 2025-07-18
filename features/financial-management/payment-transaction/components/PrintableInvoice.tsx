// components/PrintableInvoice.tsx
import React, { forwardRef, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { formatCurrency } from '@/utils/currency-formatter'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

// Updated interfaces based on your actual data structure
interface DueItem {
	id: string
	title: string
	originalAmount: string | number
	finalAmount: string | number
	paidAmount: string | number
	description?: string
	status: string
	category: {
		id: string
		title: string
	}
	createdAt: string
	updatedAt: string
}

interface StudentPayment {
	id: string
	dueItemId: string
	dueItem: DueItem
	amount: string | number
	method: 'CASH' | 'BANK' | 'ONLINE'
	reason?: string
	month: number
	year: number
	createdAt: string
	updatedAt: string
}

interface Tenant {
	id: string
	logo: string
	name: string
	email: string
	phone: string
	address: string
}

interface ClassInfo {
	id: string
	name: string
	createdAt: string
	updatedAt: string
	tenantId: string
}

interface SectionInfo {
	id: string
	name: string
	createdAt: string
	updatedAt: string
	tenantId: string
	classId: string
}

interface Student {
	id: string
	name: string
	studentId: string
	class: ClassInfo
	section: SectionInfo
	roll: string
}

interface PaymentTransaction {
	id: string
	studentId: string
	student: Student
	tenant: Tenant
	payments: StudentPayment[]
	totalAmount: string | number
	collectedBy?: string
	transactionDate: string
	printCount: number
	createdAt: string
	updatedAt: string
}

interface PrintableInvoiceProps {
	transaction: PaymentTransaction
	copyType?: 'Student Copy' | 'Admin Copy' | 'Accounts Copy'
	onPrintSuccess?: (transactionId: string) => void
	showPrintButton?: boolean
	printBothCopies?: boolean
}

export const PrintableInvoice = forwardRef<
	HTMLDivElement,
	PrintableInvoiceProps
>(
	(
		{
			transaction,
			copyType = 'Student Copy',
			onPrintSuccess,
			showPrintButton = true,
			printBothCopies = false,
		},
		ref,
	) => {
		const componentRef = useRef<HTMLDivElement>(null)
		const actualRef = componentRef

		// Helper functions
		const formatAmount = (amount: string | number) => {
			const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
			return formatCurrency(numAmount)
		}

		const getMonthName = (month: number) => {
			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			]
			return months[month - 1] || 'Unknown'
		}

		const totalAmount =
			typeof transaction.totalAmount === 'string'
				? parseFloat(transaction.totalAmount)
				: transaction.totalAmount

		// Print function
		const handlePrint = useReactToPrint({
			contentRef: actualRef,
			documentTitle: `Invoice-${transaction.id.slice(0, 8)}-${transaction.student.name}`,
			onAfterPrint: () => {
				onPrintSuccess?.(transaction.id)
			},
			pageStyle: `
				@page {
					size: A4;
					margin: 20mm;
				}
				@media print {
					body {
						-webkit-print-color-adjust: exact;
						color-adjust: exact;
						margin: 0;
						padding: 0;
					}
					.no-print {
						display: none !important;
					}
				}
			`,
		})

		return (
			<div className="bg-white p-4 max-w-4xl mx-auto">
				{/* Print Button */}
				{showPrintButton && (
					<div className="no-print mb-3 text-right">
						<Button
							onClick={handlePrint}
							className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
						>
							<Printer className="h-4 w-4 mr-2" />
							Print Invoice
						</Button>
					</div>
				)}

				{/* Invoice Content */}
				<div ref={actualRef} className="bg-white text-sm">
					{/* Copy Type Header */}
					<table className="w-full border-2 border-black mb-2">
						<tr>
							<td className="border border-black text-center py-1 bg-gray-100">
								<h2 className="text-base font-bold">{copyType}</h2>
							</td>
						</tr>
					</table>

					{/* School Header */}
					<table className="w-full border-2 border-black mb-3">
						<tr>
							<td className="border border-black p-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{transaction.tenant.logo && (
											<img
												src={transaction.tenant.logo}
												alt="School Logo"
												className="w-12 h-12 object-contain"
											/>
										)}
										<div>
											<h1 className="text-lg font-bold text-black mb-1">
												{transaction.tenant.name}
											</h1>
											<p className="text-xs text-black">
												{transaction.tenant.address}
											</p>
											<p className="text-xs text-black">
												Phone: {transaction.tenant.phone} | Email:{' '}
												{transaction.tenant.email}
											</p>
										</div>
									</div>
									<div className="text-right">
										<div className="border-2 border-black px-3 py-1 mb-2">
											<h2 className="text-base font-bold">FEE RECEIPT</h2>
										</div>
										<p className="text-xs">
											<strong>Receipt No:</strong>{' '}
											{transaction.id.slice(0, 8).toUpperCase()}
										</p>
										<p className="text-xs">
											<strong>Date:</strong>{' '}
											{format(
												new Date(transaction.transactionDate),
												'dd-MM-yyyy',
											)}
										</p>
										<p className="text-xs">
											<strong>Time:</strong>{' '}
											{format(new Date(transaction.transactionDate), 'HH:mm')}
										</p>
									</div>
								</div>
							</td>
						</tr>
					</table>

					{/* Student Information Table */}
					<table className="w-full border-2 border-black mb-3">
						<thead>
							<tr className="bg-gray-200">
								<th
									className="border border-black px-2 py-1 text-left text-sm font-bold"
									colSpan={4}
								>
									STUDENT INFORMATION
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="border border-black px-2 py-1 font-semibold w-1/4 text-xs">
									Student Name:
								</td>
								<td className="border border-black px-2 py-1 w-1/4 text-xs">
									{transaction.student.name}
								</td>
								<td className="border border-black px-2 py-1 font-semibold w-1/4 text-xs">
									Student ID:
								</td>
								<td className="border border-black px-2 py-1 w-1/4 text-xs">
									{transaction.student.studentId}
								</td>
							</tr>
							<tr>
								<td className="border border-black px-2 py-1 font-semibold text-xs">
									Class:
								</td>
								<td className="border border-black px-2 py-1 text-xs">
									{transaction.student.class.name}
								</td>
								<td className="border border-black px-2 py-1 font-semibold text-xs">
									Section:
								</td>
								<td className="border border-black px-2 py-1 text-xs">
									{transaction.student.section.name}
								</td>
							</tr>
							<tr>
								<td className="border border-black px-2 py-1 font-semibold text-xs">
									Roll Number:
								</td>
								<td className="border border-black px-2 py-1 text-xs">
									{transaction.student.roll}
								</td>
								<td className="border border-black px-2 py-1 font-semibold text-xs">
									Collected By:
								</td>
								<td className="border border-black px-2 py-1 text-xs">
									{transaction.collectedBy || 'N/A'}
								</td>
							</tr>
						</tbody>
					</table>

					{/* Payment Details Table */}
					<table className="w-full border-2 border-black mb-3">
						<thead>
							<tr className="bg-gray-200">
								<th className="border border-black px-2 py-1 text-center text-xs font-bold w-8">
									SL
								</th>
								<th className="border border-black px-2 py-1 text-left text-xs font-bold">
									Fee Description
								</th>
								<th className="border border-black px-2 py-1 text-center text-xs font-bold w-20">
									Month/Year
								</th>
								{/* <th className="border border-black px-2 py-1 text-center text-xs font-bold w-16">
									Category
								</th> */}
								<th className="border border-black px-2 py-1 text-center text-xs font-bold w-20">
									Original
								</th>
								<th className="border border-black px-2 py-1 text-center text-xs font-bold w-16">
									Method
								</th>
								<th className="border border-black px-2 py-1 text-center text-xs font-bold w-20">
									Paid
								</th>
							</tr>
						</thead>
						<tbody>
							{transaction.payments.map((payment, index) => (
								<tr key={payment.id}>
									<td className="border border-black px-2 py-1 text-center text-xs">
										{index + 1}
									</td>
									<td className="border border-black px-2 py-1 text-xs">
										<div>
											<p className="font-medium">{payment.dueItem.title}</p>
											{/* {payment.dueItem.description && (
												<p className="text-xs text-gray-600 leading-tight">
													{payment.dueItem.description}
												</p>
											)} */}
											{payment.reason && (
												<p className="text-xs text-gray-600 leading-tight">
													Note: {payment.reason}
												</p>
											)}
										</div>
									</td>
									<td className="border border-black px-2 py-1 text-center text-xs">
										{getMonthName(payment.month).slice(0, 3)} {payment.year}
									</td>
									{/* <td className="border border-black px-2 py-1 text-center text-xs">
										{payment.dueItem.category?.title}
									</td> */}
									<td className="border border-black px-2 py-1 text-right text-xs">
										{formatAmount(payment.dueItem.originalAmount)}
									</td>
									<td className="border border-black px-2 py-1 text-center text-xs">
										{payment.method}
									</td>
									<td className="border border-black px-2 py-1 text-right font-semibold text-xs">
										{formatAmount(payment.amount)}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* Payment Summary Table */}
					<table className="w-full border-2 border-black mb-4">
						<thead>
							<tr className="bg-gray-200">
								<th
									className="border border-black px-2 py-1 text-left text-sm font-bold"
									colSpan={3}
								>
									PAYMENT SUMMARY
								</th>
							</tr>
						</thead>
						<tbody>
							{/* Payment Methods Breakdown */}
							{Array.from(new Set(transaction.payments.map(p => p.method))).map(
								method => {
									const methodTotal = transaction.payments
										.filter(p => p.method === method)
										.reduce(
											(sum, p) =>
												sum +
												(typeof p.amount === 'string'
													? parseFloat(p.amount)
													: p.amount),
											0,
										)
									return (
										<tr key={method}>
											<td className="border border-black px-2 py-1 font-semibold w-1/3 text-xs">
												{method} Payment:
											</td>
											<td className="border border-black px-2 py-1 w-1/3"></td>
											<td className="border border-black px-2 py-1 text-right font-semibold w-1/3 text-xs">
												{formatAmount(methodTotal)}
											</td>
										</tr>
									)
								},
							)}

							{/* Total */}
							<tr className="bg-gray-100">
								<td className="border border-black px-2 py-1 font-bold text-sm">
									TOTAL AMOUNT PAID:
								</td>
								<td className="border border-black px-2 py-1"></td>
								<td className="border border-black px-2 py-1 text-right font-bold text-sm">
									{formatAmount(transaction.totalAmount)}
								</td>
							</tr>

							{/* Amount in Words */}
							{/* <tr>
								<td className="border border-black px-2 py-1 font-semibold text-xs">
									Amount in Words:
								</td>
								<td
									className="border border-black px-2 py-1 text-xs"
									colSpan={2}
								>
									<strong>
										Taka {Math.floor(totalAmount).toLocaleString()} Only
									</strong>
								</td>
							</tr> */}
						</tbody>
					</table>

					{/* Signature Table */}
					<table className="w-full border-2 border-black">
						<thead>
							<tr className="bg-gray-200">
								<th className="border border-black px-2 py-1 text-center w-1/3 text-xs font-bold">
									Student/Guardian
								</th>
								<th className="border border-black px-2 py-1 text-center w-1/3 text-xs font-bold">
									Cashier
								</th>
								<th className="border border-black px-2 py-1 text-center w-1/3 text-xs font-bold">
									Principal
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="border border-black px-2 py-6 text-center">
									<div className="h-12 flex items-end justify-center">
										<div className="border-t border-black w-24 pt-1">
											<p className="text-xs">Signature</p>
										</div>
									</div>
								</td>
								<td className="border border-black px-2 py-6 text-center">
									<div className="h-12 flex items-end justify-center">
										<div className="border-t border-black w-24 pt-1">
											<p className="text-xs">'Signature'</p>
										</div>
									</div>
								</td>
								<td className="border border-black px-2 py-6 text-center">
									<div className="h-12 flex items-end justify-center">
										<div className="border-t border-black w-24 pt-1">
											<p className="text-xs">Principal's Signature</p>
										</div>
									</div>
								</td>
							</tr>
						</tbody>
					</table>

					{/* Footer */}
					<div className="text-center mt-2 pt-2 border-t-2 border-black">
						<p className="text-xs font-semibold">Thank you for your payment!</p>
						<p className="text-xs">
							{transaction.tenant.name} - Fee Management System
						</p>
					</div>
				</div>

				{/* Print Styles */}
				<style jsx>{`
					@media print {
						body {
							margin: 0;
							padding: 0;
							font-size: 11px;
						}
						.no-print {
							display: none !important;
						}
						table {
							page-break-inside: avoid;
							font-size: 11px;
						}
						tr {
							page-break-inside: avoid;
						}
						.page-break {
							page-break-after: always;
						}
						h1 {
							font-size: 16px;
						}
						h2 {
							font-size: 14px;
						}
						.text-lg {
							font-size: 16px;
						}
						.text-base {
							font-size: 14px;
						}
						.text-sm {
							font-size: 12px;
						}
						.text-xs {
							font-size: 10px;
						}
					}
				`}</style>
			</div>
		)
	},
)

PrintableInvoice.displayName = 'PrintableInvoice'
