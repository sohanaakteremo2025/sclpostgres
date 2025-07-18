'use server'

import { startOfMonth, endOfMonth, addMonths, isWithinInterval } from 'date-fns'
import { getSubdomainDB } from '../getSubdomainDB'

export const calculateStudentDues = async (studentId: string) => {
	const prisma = await getSubdomainDB()
	const student = await prisma.student.findUnique({
		where: { id: studentId },
		include: {
			feeStructure: {
				include: {
					fees: true,
				},
			},
			paidFees: true,
		},
	})

	console.log(student)

	if (!student || !student.feeStructure) {
		throw new Error('Student or fee structure not found')
	}

	const today = new Date()
	const admissionDate = new Date(student.admissionDate)
	const latestPaymentDate = student.paidFees.reduce((latest, payment) => {
		const paymentDate = new Date(payment.datePaid)
		return paymentDate > latest ? paymentDate : latest
	}, new Date(0))

	const calculationEndDate =
		latestPaymentDate > today ? latestPaymentDate : today
	const monthsToCalculate =
		(calculationEndDate.getFullYear() - admissionDate.getFullYear()) * 12 +
		(calculationEndDate.getMonth() - admissionDate.getMonth())

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

	const calculateLateFees = (
		fee: (typeof student.feeStructure.fees)[number],
		dueDate: Date,
		paidAmount: number,
	) => {
		if (!fee.lateFeeEnabled || !fee.lateFeeAmount || !fee.lateFeeFrequency)
			return 0
		if (today <= dueDate) return 0

		const daysLate = Math.ceil(
			(today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
		)
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

	const monthlyDues: any[] = []

	for (let i = 0; i <= monthsToCalculate; i++) {
		const currentMonth = new Date(
			admissionDate.getFullYear(),
			admissionDate.getMonth() + i,
			1,
		)
		const monthStart = startOfMonth(currentMonth)
		const monthEnd = endOfMonth(currentMonth)

		const monthDues = {
			month: currentMonth,
			dues: [],
			totalDue: 0,
			totalPaid: 0,
			totalLateFee: 0,
		} as any

		for (const fee of student.feeStructure.fees) {
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
				waiverAmount =
					fee.waiverType === 'PERCENTAGE'
						? dueAmount * (fee.waiverValue / 100)
						: fee.waiverValue
			}

			const actualDueAmount = Math.max(0, dueAmount - waiverAmount)
			const lateFeeAmount = calculateLateFees(fee, monthEnd, paidAmount)

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
		}

		if (monthDues.dues.length > 0) {
			monthlyDues.push(monthDues)
		}
	}

	return monthlyDues
}
