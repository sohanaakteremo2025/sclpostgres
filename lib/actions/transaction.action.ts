'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Transaction } from '@prisma/client'

export const createTransaction = async (data: any) => {
	const session = await auth()
	if (!session?.user) return null
	const userEmail = session.user.email as string
	data.transactionBy = userEmail

	const tenantId = session.user.tenantId

	const prisma = await getSubdomainDB()
	try {
		const transaction = await prisma.transaction.create({
			data: { ...data, tenantId },
		})
		revalidatePath('/dashboard/admin/transactions')
		return JSON.parse(JSON.stringify(transaction))
	} catch (error) {
		console.log('ERROR CREATING TRANSACTION:  ', error)
		return JSON.parse(JSON.stringify(error))
	}
}

export const getAllTransactions = async (): Promise<Transaction[]> => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				tenantId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
		return JSON.parse(JSON.stringify(transactions))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getAllTransactionsOfThisMonth = async () => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				tenantId,
				createdAt: {
					gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
					lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
				},
			},
		})
		return JSON.parse(JSON.stringify(transactions))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const updateTransaction = async (id: string, data: any) => {
	const prisma = await getSubdomainDB()
	try {
		const transaction = await prisma.transaction.update({
			where: { id },
			data,
		})
		revalidatePath('/dashboard/admin/transactions')
		return JSON.parse(JSON.stringify(transaction))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const deleteTransaction = async (id: string) => {
	const prisma = await getSubdomainDB()
	try {
		const transaction = await prisma.transaction.delete({ where: { id } })
		revalidatePath('/dashboard/admin/transactions')
		return JSON.parse(JSON.stringify(transaction))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
