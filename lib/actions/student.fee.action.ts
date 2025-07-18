'use server'
import { getSubdomainDB } from '../getSubdomainDB'
import { getCurrentUser } from './auth.action'
import { sendSMS } from './sms.action'
import { getStudentById } from './student.action'

export const submitFeePayments = async (
	payments: {
		feeItemId: string
		amountPaid: number
		datePaid: Date // When payment is made
		feeMonth: Date // Which month this payment is for (now handled separately)
		studentId: string
	}[],
) => {
	try {
		const prisma = await getSubdomainDB()
		const student = await getStudentById(payments[0].studentId)
		const currentUser = await getCurrentUser()

		let totalAmount = 0
		// Create payments, month associations, and one transaction for the total amount
		const result = await prisma.$transaction(async tx => {
			const createdPayments = []

			for (const payment of payments) {
				// 1. Create the payment as before
				const newPayment = await tx.studentFeePayment.create({
					data: {
						feeItemId: payment.feeItemId,
						amountPaid: payment.amountPaid,
						datePaid: payment.datePaid,
						studentId: payment.studentId,
					},
				})

				// 2. Create the month association
				await tx.feeMonthAssociation.create({
					data: {
						paymentId: newPayment.id,
						feeMonth: payment.feeMonth,
					},
				})

				// Accumulate the total amount
				totalAmount += payment.amountPaid

				createdPayments.push(newPayment)
			}

			// Create a single transaction record for the total amount
			await tx.transaction.create({
				data: {
					tenantId: student.tenantId,
					label: `Student Fee Payment`,
					note: `Fee payment for student: ${student.fullName} - ID: ${student.studentId} - ${student.class.name} - ${student.section.name}`,
					category: 'monthly_fee',
					type: 'income',
					amount: totalAmount,
					transactionBy: currentUser?.email || 'Admin',
				},
			})

			return createdPayments
		})
		// send sms
		await sendSMS({
			number: student?.guardianPhone,
			message: `Dear parent, Your child ${
				student?.fullName
			} has paid ${totalAmount} for ${payments[0].feeMonth.toISOString()}`,
		})

		return result
	} catch (error) {
		console.error('Error submitting fee payments:', error)
		throw new Error('Failed to submit fee payments')
	}
}
// 3. Update your getAllStudentFeePayments to include the fee month data:
export interface TGroupedTransaction {
	id: string
	studentId: string
	className: string
	sectionName: string
	studentName: string
	studentRoll: string
	feeItems: Array<{
		id: number
		name: string
		amount: number
		amountPaid: number
		frequency: string
		waiverValue: number
		lateFeeAmount: number
		datePaid: Date
		feeMonth: Date | null
		studentFeePaymentId: string // Added this to each fee item
	}>
	datePaid: Date
	totalAmount: number
	studentFeePaymentIds: string[] // Added this array to store all payment IDs for the transaction
}
export const getAllStudentFeePayments = async (): Promise<
	TGroupedTransaction[]
> => {
	try {
		const prisma = await getSubdomainDB()
		console.warn('This is inited')

		// Get all payments
		const payments = await prisma.studentFeePayment.findMany({
			include: {
				feeItem: true,
				student: {
					include: {
						class: true,
						section: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		// Get all fee month associations
		const feeMonthAssociations = await prisma.feeMonthAssociation.findMany()

		// Create a map for quick lookups
		const feeMonthMap = feeMonthAssociations.reduce((map, assoc) => {
			map[assoc.paymentId] = assoc.feeMonth
			return map
		}, {} as Record<string, Date>)

		// Enrich payments with fee month data
		const enrichedPayments = payments.map(payment => ({
			...payment,
			feeMonth: feeMonthMap[payment.id] || null,
		}))

		// Group payments by transaction
		const groupedTransactions = groupFeesByTransaction(enrichedPayments)

		// Convert to array
		const groupedTransactionsArray = Object.values(groupedTransactions)

		return JSON.parse(JSON.stringify(groupedTransactionsArray))
	} catch (error: any) {
		console.error('Error getting student payments:', error)
		throw new Error('Failed to get student payments')
	}
}

// 4. Update the groupFeesByTransaction function to include fee months:
function groupFeesByTransaction(
	payments: any[],
): Record<string, TGroupedTransaction> {
	const grouped: Record<string, TGroupedTransaction> = {}

	payments.forEach(payment => {
		// Create a transaction key based on student and payment date
		const paymentDate = new Date(payment.datePaid)
		const dateKey = `${paymentDate.getFullYear()}-${
			paymentDate.getMonth() + 1
		}-${paymentDate.getDate()}`
		const transactionKey = `${payment.studentId}_${dateKey}`

		if (!grouped[transactionKey]) {
			grouped[transactionKey] = {
				id: transactionKey,
				studentId: payment.studentId,
				className: payment.student.class?.name || 'N/A',
				sectionName: payment.student.section?.name || 'N/A',
				studentName: payment.student.fullName || 'N/A',
				studentRoll: payment.student.studentId || 'N/A',
				feeItems: [],
				datePaid: payment.datePaid,
				totalAmount: 0,
				studentFeePaymentIds: [], // Add this array to store the payment IDs
			}
		}

		// Store the payment ID in the studentFeePaymentIds array
		grouped[transactionKey].studentFeePaymentIds.push(payment.id)

		// Add fee item with both datePaid and feeMonth
		grouped[transactionKey].feeItems.push({
			id: payment.feeItem?.id ?? 1,
			name: payment.feeItem?.name ?? '',
			amount: payment.feeItem?.amount,
			amountPaid: payment.amountPaid,
			frequency: payment.feeItem?.frequency ?? '',
			waiverValue: payment.feeItem?.waiverValue ?? 0,
			lateFeeAmount: payment.feeItem?.lateFeeAmount ?? 0,
			datePaid: payment.datePaid, // When payment was made
			feeMonth: payment.feeMonth, // Comes from our enriched data
			studentFeePaymentId: payment.id, // Also include the ID in each fee item for convenience
		})

		// Update total
		grouped[transactionKey].totalAmount += payment.amountPaid
	})

	return grouped
}

export const getStudentFeePayments = async (studentId: string) => {
	try {
		const prisma = await getSubdomainDB()
		const payments = await prisma.studentFeePayment.findMany({
			where: { studentId },
		})
		return { success: true, data: payments }
	} catch (error: any) {
		console.error('Error getting student payments:', error)
		return { success: false, error: error.message }
	}
}

export const deleteManyFeePayments = async (studentFeePaymentIds: string[]) => {
	try {
		const prisma = await getSubdomainDB()

		// Delete fee month associations first (if they exist)
		await prisma.feeMonthAssociation.deleteMany({
			where: {
				paymentId: {
					in: studentFeePaymentIds,
				},
			},
		})

		// Now delete the student fee payments
		const deleteResult = await prisma.studentFeePayment.deleteMany({
			where: {
				id: {
					in: studentFeePaymentIds,
				},
			},
		})

		return { success: true, count: deleteResult.count }
	} catch (error: any) {
		console.error('Error deleting student fee payments:', error)
		throw new Error('Failed to delete student fee payments')
	}
}
