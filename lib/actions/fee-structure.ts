'use server'

import { FeeFrequency, FeeItem, WaiverType } from '@prisma/client'
import { getSubdomainDB } from '../getSubdomainDB'
import { getCurrentUser } from './auth.action'
import { revalidatePath } from 'next/cache'
// export type FeeFrequency = 'one-time' | 'monthly' | 'quarterly' | 'annually'
// export type WaiverType = 'percentage' | 'fixed'

interface Waiver {
	type?: WaiverType | null
	value?: number | null
}

interface CreateFeeItemInput {
	name: string
	amount: number
	frequency: FeeFrequency
	waiver?: Waiver | null
	lateFeeEnabled: boolean
	lateFeeAmount?: number | null
	lateFeeFrequency?: FeeFrequency | null
}

interface CreateFeeStructureInput {
	title: string
	fees: CreateFeeItemInput[]
}

interface RecordPaymentInput {
	studentId: string
	feeItemId: string
	amountPaid: number
	datePaid: string
}

export async function createFeeStructure(data: CreateFeeStructureInput) {
	const prisma = await getSubdomainDB()
	const user = await getCurrentUser()
	const tenantId = user?.tenantId as string

	try {
		return await prisma.feeStructure.create({
			data: {
				tenantId,
				title: data.title,
				fees: {
					create: data.fees.map(fee => ({
						name: fee.name,
						amount: fee.amount,
						frequency: fee.frequency,
						waiverType: fee.waiver?.type,
						waiverValue: fee.waiver?.value,
						lateFeeEnabled: fee.lateFeeEnabled, // Add late fee fields
						lateFeeAmount: fee.lateFeeAmount,
						lateFeeFrequency: fee.lateFeeFrequency,
					})),
				},
			},
			include: { fees: true },
		})
	} catch (error) {
		console.error('Error creating fee structure:', error)
		throw new Error('Failed to create fee structure.')
	}
}

export type FeeStructureType = Awaited<
	ReturnType<typeof getAllFeeStructures>
>[number]

export type TFeeStructureWithFees = FeeStructureType & { fees: FeeItem[] }

export async function getAllFeeStructures() {
	const prisma = await getSubdomainDB()
	try {
		const feeStructures = await prisma.feeStructure.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				fees: true,
			},
		})
		revalidatePath('/dashboard/admin/fee-structures')
		return JSON.parse(JSON.stringify(feeStructures))
	} catch (error) {
		console.error('Error getting fee structures:', error)
		throw new Error('Failed to get fee structures.')
	}
}

export interface UpdateFeeStructureInput {
	id: string // ID of the fee structure to update
	title: string
	fees: Array<{
		id?: string // ID of the fee item (if it exists)
		name: string
		amount: number
		frequency: FeeFrequency
		waiver?: {
			type?: WaiverType | null
			value?: number | null
		} | null
		lateFeeEnabled: boolean
		lateFeeAmount?: number | null
		lateFeeFrequency?: FeeFrequency | null
	}>
}

export async function updateFeeStructure(data: UpdateFeeStructureInput) {
	console.log('Updating fee structure:', data)
	const prisma = await getSubdomainDB()
	const user = await getCurrentUser()
	const tenantId = user?.tenantId as string

	try {
		// Use a transaction to ensure all operations succeed together
		return await prisma.$transaction(async tx => {
			// Update the fee structure title
			const feeStructure = await tx.feeStructure.update({
				where: { id: data.id, tenantId },
				data: { title: data.title },
			})

			// Fetch existing fees
			const existingFees = await tx.feeItem.findMany({
				where: { feeStructureId: data.id },
				select: { id: true },
			})
			const existingFeeIds = existingFees.map(fee => fee.id)

			// Separate new and existing fees
			const newFees = data.fees.filter(fee => !fee.id) // No ID → new fee
			const updatedFees = data.fees.filter(fee => fee.id) // Has ID → existing fee

			// Delete removed fees (fees that exist in DB but not in update request)
			const updatedFeeIds = updatedFees.map(fee => fee.id)
			const feesToDelete = existingFeeIds.filter(
				id => !updatedFeeIds.includes(id),
			)

			if (feesToDelete.length > 0) {
				await tx.feeItem.deleteMany({
					where: { id: { in: feesToDelete } },
				})
			}

			// Update existing fees
			await Promise.all(
				updatedFees.map(fee =>
					tx.feeItem.update({
						where: { id: fee.id },
						data: {
							name: fee.name,
							amount: fee.amount,
							frequency: fee.frequency,
							waiverType: fee.waiver?.type,
							waiverValue: fee.waiver?.value,
							lateFeeEnabled: fee.lateFeeEnabled,
							lateFeeAmount: fee.lateFeeAmount,
							lateFeeFrequency: fee.lateFeeFrequency,
						},
					}),
				),
			)

			// Insert new fees
			if (newFees.length > 0) {
				await tx.feeItem.createMany({
					data: newFees.map(fee => ({
						feeStructureId: data.id,
						name: fee.name,
						amount: fee.amount,
						frequency: fee.frequency,
						waiverType: fee.waiver?.type,
						waiverValue: fee.waiver?.value,
						lateFeeEnabled: fee.lateFeeEnabled,
						lateFeeAmount: fee.lateFeeAmount,
						lateFeeFrequency: fee.lateFeeFrequency,
					})),
				})
			}

			revalidatePath('/dashboard/admin/fee-structures')
			return JSON.parse(JSON.stringify(feeStructure))
		})
	} catch (error) {
		console.error('Error updating fee structure:', error)
		throw new Error('Failed to update fee structure.')
	}
}

export async function deleteFeeStructure(id: string) {
	const prisma = await getSubdomainDB()
	const user = await getCurrentUser()
	const tenantId = user?.tenantId as string

	try {
		const feeStructure = await prisma.feeStructure.delete({
			where: { id, tenantId }, // Ensure the fee structure belongs to the tenant
		})
		revalidatePath('/dashboard/admin/fee-structures')
		return JSON.parse(JSON.stringify(feeStructure))
	} catch (error) {
		console.error('Error deleting fee structure:', error)
		throw new Error('Failed to delete fee structure.')
	}
}
