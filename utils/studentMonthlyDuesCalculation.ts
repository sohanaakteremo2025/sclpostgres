import { TStudentWithClassAndSection } from '@/lib/actions/student.action'
import { startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns'

export interface MonthlyDue {
	month: Date
	dues: {
		feeId: string
		feeName: string
		amount: number
		waiver: number
		dueAmount: number
		paidAmount: number
		frequency: string
		lateFeeAmount: number
	}[]
	totalDue: number
	totalPaid: number
	totalLateFee: number
}

export const calculateMonthlyDues = (
	student: TStudentWithClassAndSection,
	feeStructure: TStudentWithClassAndSection['feeStructure'],
): MonthlyDue[] => {
	const today = new Date()
	const admissionDate = new Date(student.admissionDate)

	// Find the latest payment date, including future payments
	const latestPaymentDate = student.paidFees.reduce((latest, payment) => {
		const paymentDate = new Date(payment.datePaid)
		return paymentDate > latest ? paymentDate : latest
	}, new Date(0)) // Start with epoch time to ensure we find the actual latest date

	// Determine the end date for calculations (either today or latest payment date)
	const calculationEndDate =
		latestPaymentDate > today ? latestPaymentDate : today

	// Calculate months between admission and end date
	const monthsToCalculate =
		(calculationEndDate.getFullYear() - admissionDate.getFullYear()) * 12 +
		(calculationEndDate.getMonth() - admissionDate.getMonth())

	const monthlyDues: MonthlyDue[] = []

	// Helper function to get total payments for a fee item within a date range
	const getTotalPayments = (feeId: string, startDate: Date, endDate: Date) => {
		return student.paidFees
			.filter(
				payment =>
					payment.feeItemId === feeId &&
					isWithinInterval(new Date(payment.datePaid), {
						start: startDate,
						end: endDate,
					}),
			)
			.reduce((sum, payment) => sum + payment.amountPaid, 0)
	}

	// Helper function to calculate late fees
	const calculateLateFees = (
		fee: (typeof feeStructure.fees)[number],
		dueDate: Date,
		paidAmount: number,
	) => {
		if (!fee.lateFeeEnabled || !fee.lateFeeAmount || !fee.lateFeeFrequency) {
			return 0
		}

		const currentDate = today // Use actual today's date for late fee calculation
		if (currentDate <= dueDate) {
			return 0 // No late fees if not yet due
		}

		const timeDiff = currentDate.getTime() - dueDate.getTime()
		const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

		switch (fee.lateFeeFrequency) {
			case 'DAILY':
				return fee.lateFeeAmount * daysLate
			case 'WEEKLY':
				return fee.lateFeeAmount * Math.ceil(daysLate / 7)
			case 'MONTHLY':
				return fee.lateFeeAmount * Math.ceil(daysLate / 30)
			default:
				return 0
		}
	}

	// Calculate dues for each month between admission and the calculation end date
	for (let i = 0; i <= monthsToCalculate; i++) {
		const currentMonth = new Date(
			admissionDate.getFullYear(),
			admissionDate.getMonth() + i,
			1,
		)

		const monthStart = startOfMonth(currentMonth)
		const monthEnd = endOfMonth(currentMonth)

		const monthDues: MonthlyDue = {
			month: currentMonth,
			dues: [],
			totalDue: 0,
			totalPaid: 0,
			totalLateFee: 0,
		}

		feeStructure.fees.forEach(fee => {
			let dueAmount = 0
			let paidAmount = 0

			switch (fee.frequency) {
				case 'ONE_TIME':
					if (i === 0) {
						dueAmount = fee.amount
						paidAmount = getTotalPayments(fee.id, monthStart, monthEnd)
					}
					break

				case 'MONTHLY':
					dueAmount = fee.amount
					paidAmount = getTotalPayments(fee.id, monthStart, monthEnd)
					break

				case 'QUARTERLY':
					if (i % 3 === 0) {
						const quarterStart = monthStart
						const quarterEnd = endOfMonth(addMonths(currentMonth, 2))
						dueAmount = fee.amount
						paidAmount = getTotalPayments(fee.id, quarterStart, quarterEnd)
					}
					break

				case 'ANNUALLY':
					if (i % 12 === 0) {
						const yearStart = new Date(currentMonth.getFullYear(), 0, 1)
						const yearEnd = new Date(currentMonth.getFullYear(), 11, 31)
						dueAmount = fee.amount
						paidAmount = getTotalPayments(fee.id, yearStart, yearEnd)
					}
					break
			}

			let waiverAmount = 0
			if (fee.waiverType && fee.waiverValue !== null) {
				if (fee.waiverType === 'PERCENTAGE') {
					waiverAmount = dueAmount * (fee.waiverValue / 100)
				} else if (fee.waiverType === 'FIXED') {
					waiverAmount = fee.waiverValue
				}
			}

			const actualDueAmount = Math.max(0, dueAmount - waiverAmount)
			const lateFeeAmount = calculateLateFees(fee, monthEnd, paidAmount)

			// Add to dues if there's an amount due, payment made, or late fees
			if (actualDueAmount > 0 || paidAmount > 0 || lateFeeAmount > 0) {
				monthDues.dues.push({
					feeId: fee.id,
					feeName: fee.name,
					amount: fee.amount,
					waiver: waiverAmount,
					dueAmount: actualDueAmount,
					paidAmount: paidAmount,
					frequency: fee.frequency,
					lateFeeAmount: lateFeeAmount,
				})

				monthDues.totalDue += actualDueAmount + lateFeeAmount
				monthDues.totalPaid += paidAmount
				monthDues.totalLateFee += lateFeeAmount
			}
		})

		if (monthDues.dues.length > 0) {
			monthlyDues.push(monthDues)
		}
	}

	return monthlyDues
}
