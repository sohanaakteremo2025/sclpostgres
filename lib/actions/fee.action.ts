'use server'

import { revalidatePath } from 'next/cache'
import { createTransaction } from './transaction.action'
import { getStudentById } from './student.action'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Prisma } from '@prisma/client'
import { getSMSSettings, sendSMS } from './sms.action'

export const createFee = async (data: any) => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId

	const prisma = await getSubdomainDB()

	try {
		const fee = await prisma.fee.create({
			data: { ...data, tenantId },
		})
		const student = await getStudentById(data.studentId)

		const smsNotificationConfig = await getSMSSettings()
		const feesNotification = smsNotificationConfig?.settings.find(
			(setting: any) => setting.id === 'feeCollection',
		)
		await createTransaction({
			tenantId,
			amount: data.amount,
			type: 'income',
			category: data.reason.join(', '),
			label: `fees by ${student?.fullName}-${student?.class?.name}-${student?.section?.name}`,
			note: `${
				data.reason.length === 1 ? data.reason[0] : data.reason.join(', ')
			} By ${student?.fullName} class - ${student?.class?.name} section - ${
				student?.section?.name
			}`,
		})
		// send sms to guardian
		if (feesNotification?.isEnabled) {
			await sendSMS({
				number: student?.guardianPhone,
				message: `Dear parent, Your child ${student?.fullName} has paid ${
					data.amount
				} for ${
					data.reason.length === 1 ? data.reason[0] : data.reason.join(', ')
				}`,
			})
		}

		revalidatePath('/dashboard/admin/fees')
		return JSON.parse(JSON.stringify(fee))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export type TFee = Prisma.FeeGetPayload<{
	include: {
		student: true
		class: true
		section: true
	}
}>

export const getAllFees = async (): Promise<TFee[]> => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const fees = await prisma.fee.findMany({
			where: { tenantId },
			include: {
				// student: true,
				class: true,
				section: true,
			},
			orderBy: { createdAt: 'desc' },
		})
		return JSON.parse(JSON.stringify(fees))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const deleteFee = async (id: string) => {
	const prisma = await getSubdomainDB()
	try {
		const fee = await prisma.fee.delete({ where: { id } })
		revalidatePath('/dashboard/admin/fees')
		return JSON.parse(JSON.stringify(fee))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const updateFee = async (id: string, data: any) => {
	const prisma = await getSubdomainDB()
	try {
		const fee = await prisma.fee.update({ where: { id }, data })
		revalidatePath('/dashboard/admin/fees')
		return JSON.parse(JSON.stringify(fee))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getFeeForTheStudent = async ({
	studentId,
	classId,
	sectionId,
	reason,
	year,
}: {
	studentId: string
	classId: string
	sectionId: string
	reason?: string
	year?: number
}) => {
	const prisma = await getSubdomainDB()
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	try {
		const fees = await prisma.fee.findMany({
			where: {
				tenantId,
				studentId,
				classId,
				sectionId,
				reason: {
					has: reason,
				},
				year: year || new Date().getFullYear(),
			},
		})
		return JSON.parse(JSON.stringify(fees))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
