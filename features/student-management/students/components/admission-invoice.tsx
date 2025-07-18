'use client'

import React from 'react'
import { format } from 'date-fns'
import { ReceiptText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReactToPrint } from 'react-to-print'
import { currencySimbols } from '@/constants/constants'
import { QRCodeSVG } from 'qrcode.react'
import { formatCurrency } from '@/utils/currency-formatter'

interface StudentData {
	id: string
	name: string
	photo?: string
	email: string
	phone: string
	dateOfBirth: string
	gender: string
	address: string
	religion: string
	roll: string
	status: string
	studentId: string
	fatherName: string
	motherName: string
	guardianPhone: string
	admissionDate: string
	tenantId: string
	tenant: {
		id: string
		name: string
		domain: string
		logo: string
		email: string
		phone: string
		address: string
	}
	class: {
		id: string
		name: string
	}
	section: {
		id: string
		name: string
	}
	session: {
		id: string
		title: string
	}
	feeStructure: {
		id: string
		title: string
		feeItems: {
			id: string
			name: string
			amount: string
			category: string
			description: string
			frequency: string
			lateFeeEnabled: boolean
			lateFeeFrequency: string
			lateFeeAmount: string
			lateFeeGraceDays: number
			status: string
			createdAt: string
			updatedAt: string
		}[]
	}
}

interface AdmissionReceiptProps {
	student: StudentData
	receiptNumber?: string
	hideButton?: boolean
	websiteUrl?: string
}

const AdmissionReceipt = React.forwardRef<
	HTMLDivElement,
	AdmissionReceiptProps
>(
	(
		{
			student,
			receiptNumber = `ADM-${new Date().getFullYear()}-${student.roll}`,
			hideButton = false,
			websiteUrl = typeof window !== 'undefined' ? window.location.origin : '',
		},
		ref,
	) => {
		const componentRef = React.useRef<HTMLDivElement>(null)
		const actualRef = ref ?? componentRef

		const printFn = useReactToPrint({
			contentRef: componentRef,
			documentTitle: 'Admission Receipt',
			pageStyle: `
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `,
		})

		const formattedAdmissionDate = student.admissionDate
			? format(new Date(student.admissionDate), 'MMM dd, yyyy')
			: format(new Date(), 'MMM dd, yyyy')

		return (
			<section className="relative">
				{/* Print Button */}
				{!hideButton && (
					<div className="mb-4 flex justify-end no-print">
						<Button
							variant="outline"
							onClick={() => printFn()}
							className="flex items-center gap-2"
						>
							<ReceiptText className="w-4 h-4" />
							Print Admission Receipt
						</Button>
					</div>
				)}

				{/* Receipt Content */}
				<div
					ref={actualRef}
					className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none"
				>
					<div className="p-8 print:p-6">
						{/* Header */}
						<div className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
							<div className="flex items-center space-x-4">
								<img
									src={student.tenant?.logo}
									alt={student.tenant?.name}
									className="h-16 w-16 object-contain"
								/>
								<div>
									<h1 className="text-2xl font-bold text-blue-600">
										{student.tenant?.name}
									</h1>
									<p className="text-sm text-gray-600">
										{student.tenant?.address}
									</p>
									<p className="text-sm text-gray-600">
										Phone: {student.tenant?.phone}
									</p>
								</div>
							</div>
							<div className="text-right">
								<h2 className="text-xl font-bold text-red-600 mb-2">
									ADMISSION RECEIPT
								</h2>
								<p className="text-sm text-gray-600">
									<strong>Receipt #:</strong> {receiptNumber}
								</p>
								<p className="text-sm text-gray-600">
									<strong>Date:</strong> {format(new Date(), 'MMM dd, yyyy')}
								</p>
							</div>
						</div>

						{/* Student Information */}
						<div className="mb-6">
							<h3 className="text-lg font-bold text-gray-700 mb-3">
								Student Information
							</h3>
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-2">
									<div className="flex">
										<span className="font-semibold text-gray-700 w-28">
											Name:
										</span>
										<span className="text-gray-900">{student.name}</span>
									</div>
									<div className="flex">
										<span className="font-semibold text-gray-700 w-28">
											Student ID:
										</span>
										<span className="text-gray-900">{student.studentId}</span>
									</div>
									<div className="flex">
										<span className="font-semibold text-gray-700 w-28">
											Class:
										</span>
										<span className="text-gray-900">{student.class.name}</span>
									</div>
									<div className="flex">
										<span className="font-semibold text-gray-700 w-28">
											Section:
										</span>
										<span className="text-gray-900">
											{student.section.name}
										</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex">
										<span className="font-semibold text-gray-700 w-28">
											Roll:
										</span>
										<span className="text-gray-900">{student.roll}</span>
									</div>
									<div className="flex">
										<span className="font-semibold text-gray-700 w-28">
											Session:
										</span>
										<span className="text-gray-900">
											{student.session.title}
										</span>
									</div>
									<div className="flex">
										<span className="font-semibold text-gray-700 w-28">
											Admission Date:
										</span>
										<span className="text-gray-900">
											{formattedAdmissionDate}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Fee Structure Table */}
						<div className="mb-6">
							<h3 className="text-lg font-bold text-gray-700 mb-3">
								Fee Structure
							</h3>
							<table className="w-full border-2 border-gray-400">
								<thead>
									<tr className="bg-gray-100">
										<th className="border border-gray-400 p-3 text-left font-semibold">
											Fee Type
										</th>
										<th className="border border-gray-400 p-3 text-center font-semibold">
											Frequency
										</th>
										<th className="border border-gray-400 p-3 text-right font-semibold">
											Amount (BDT)
										</th>
										<th className="border border-gray-400 p-3 text-right font-semibold">
											Late Fee (BDT)
										</th>
									</tr>
								</thead>
								<tbody>
									{student.feeStructure.feeItems.map(fee => (
										<tr key={fee.id}>
											<td className="border border-gray-400 p-3">
												<div className="font-medium">{fee.name}</div>
												{/* <div className="text-sm text-gray-600">
													{fee.description}
												</div> */}
											</td>
											<td className="border border-gray-400 p-3 text-center">
												<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
													{fee.frequency}
												</span>
											</td>
											<td className="border border-gray-400 p-3 text-right font-medium">
												{formatCurrency
													? formatCurrency(parseFloat(fee.amount))
													: `${currencySimbols['BDT']}${parseFloat(fee.amount).toFixed(2)}`}
											</td>
											<td className="border border-gray-400 p-3 text-right">
												{fee.lateFeeEnabled ? (
													<div className="text-sm">
														<div className="font-medium text-orange-600">
															{formatCurrency
																? formatCurrency(parseFloat(fee.lateFeeAmount))
																: `${currencySimbols['BDT']}${parseFloat(fee.lateFeeAmount).toFixed(2)}`}
														</div>
														<div className="text-xs text-gray-500">
															per {fee.lateFeeFrequency.toLowerCase()}
														</div>
														<div className="text-xs text-gray-500">
															after {fee.lateFeeGraceDays} days
														</div>
													</div>
												) : (
													<span className="text-gray-400">No late fee</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* QR Code and Signature */}
						<div className="flex justify-between items-end">
							<div className="text-center">
								<QRCodeSVG
									value={`${websiteUrl}/students/${student.id}`}
									size={60}
									className="mx-auto mb-2"
								/>
								<p className="text-xs text-gray-600">Student Portal</p>
							</div>
							<div className="text-center">
								<div className="border-t-2 border-gray-600 w-48 mb-2"></div>
								<p className="text-sm font-semibold text-gray-700">
									Authorized Signature
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		)
	},
)

AdmissionReceipt.displayName = 'AdmissionReceipt'

export default AdmissionReceipt
