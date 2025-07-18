import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { currencySimbols } from '@/constants/constants'

interface SalaryBreakdownProps {
	monthlySalary: number
	paidMonths: { month: string; amount: number }[]
	totalPaid: number
	employeeName: string
}

export function EmployeeSalaryBreakdown({
	monthlySalary,
	paidMonths,
	totalPaid,
	employeeName,
}: SalaryBreakdownProps) {
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

	return (
		<div className="bg-white rounded-lg p-6 shadow-md">
			<div className="flex justify-center flex-col items-center gap-2 mb-5">
				<div className="text-lg font-semibold text-gray-700 text-center flex flex-col">
					<span>Yearly Salary Breakdown of</span>
					<span className="text-primary"> Mr. {employeeName}</span>
				</div>
				<div>
					<span>Monthly Salary: </span>
					<span className="font-medium">
						{currencySimbols['BDT']} {monthlySalary}
					</span>
				</div>
				<div>
					<span>Total Paid This Year: </span>
					<span className="font-medium">
						{currencySimbols['BDT']} {totalPaid}
					</span>
				</div>
			</div>
			<div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
				{paidMonths.map((month, index) => (
					<div
						key={index}
						className="flex flex-col items-center p-2 bg-gray-50 rounded-md shadow-md py-5 border border-gray-200"
					>
						<span className="text-sm font-medium text-gray-600 mb-1">
							{month.month}
						</span>
						{months.includes(month.month) ? (
							<CheckCircle2 className="w-6 h-6 text-green-500" />
						) : (
							<XCircle className="w-6 h-6 text-red-500" />
						)}
						<Badge
							variant={
								months.includes(month.month) && month.amount === monthlySalary
									? 'default'
									: month.amount < monthlySalary
									? 'destructive'
									: 'secondary'
							}
							className="mt-1"
						>
							{currencySimbols['BDT']}
							{month.amount}
						</Badge>
					</div>
				))}
			</div>
		</div>
	)
}
