'use server'

import { revalidatePath } from 'next/cache'
import { createTransaction } from './transaction.action'
import { getEmployeeById } from './employee.action'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Prisma } from '@prisma/client'

export const createSalary = async (data: any) => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const salary = await prisma.salary.create({
			data: { ...data, tenantId },
		})
		const employee = await getEmployeeById(data.employeeId)

		await createTransaction({
			tenantId,
			amount: data.amount,
			type: 'expense',
			category: data.reason,
			label: data.reason,
			note: `${data.reason} To ${employee?.role} -> ${employee?.fullName} `,
		})

		revalidatePath('/dashboard/admin/salaries')
		return JSON.parse(JSON.stringify(salary))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
export type TSalary = Prisma.SalaryGetPayload<{
	include: {
		employee: true
	}
}>
export const getAllSalaries = async () => {
	const prisma = await getSubdomainDB()
	try {
		const salaries = await prisma.salary.findMany({
			include: {
				employee: true,
			},
		})
		return JSON.parse(JSON.stringify(salaries))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const deleteSalary = async (id: string) => {
	const prisma = await getSubdomainDB()
	try {
		const salary = await prisma.salary.delete({ where: { id } })
		revalidatePath('/dashboard/admin/salaries')
		return JSON.parse(JSON.stringify(salary))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const updateSalary = async (id: string, data: any) => {
	const prisma = await getSubdomainDB()
	try {
		const salary = await prisma.salary.update({ where: { id }, data })
		revalidatePath('/dashboard/admin/salaries')
		return JSON.parse(JSON.stringify(salary))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getSalaryByEmployeeIdThisYear = async (employeeId: string) => {
	const prisma = await getSubdomainDB()
	try {
		const salary = await prisma.salary.findMany({
			where: {
				employeeId,
				year: new Date().getFullYear(),
			},
		})
		return JSON.parse(JSON.stringify(salary))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
