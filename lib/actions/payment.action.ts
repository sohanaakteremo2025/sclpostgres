'use server'
import { getPrismaClient } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const prisma = getPrismaClient()

export async function createPayment(data: any) {
	try {
		const payment = await prisma.payment.create({ data })
		revalidatePath('/dashboard/admin/payments')
		return JSON.parse(JSON.stringify(payment))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function updatePayment(id: string, data: any) {
	try {
		const payment = await prisma.payment.update({ where: { id }, data })
		revalidatePath('/dashboard/admin/payments')
		return JSON.parse(JSON.stringify(payment))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function deletePayment(id: string) {
	try {
		const payment = await prisma.payment.delete({ where: { id } })
		revalidatePath('/dashboard/admin/payments')
		return JSON.parse(JSON.stringify(payment))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

//update nextPaymentDate or nextDomainRenewDate based on payment amount
export async function updateNextPaymentDate(id: string, data: any) {
	try {
		const tenant = await prisma.tenant.update({
			where: { id },
			data,
		})
		revalidatePath('/cms/tenants/list')
		return JSON.parse(JSON.stringify(tenant))
	} catch (error) {
		console.error('Error updating next payment date:', error)
		throw new Error('Failed to update next payment date')
	}
}

export async function getAllPayments() {
	try {
		const payments = await prisma.payment.findMany()
		return JSON.parse(JSON.stringify(payments))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
