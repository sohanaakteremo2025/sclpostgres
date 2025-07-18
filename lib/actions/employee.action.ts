'use server'

import { EmployeeFormSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { createAccount, getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Employee } from '@prisma/client'

export async function createEmployee(data: EmployeeFormSchema) {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		// Validate input
		if (!data.fullName || !data.email || !data.phone || !data.role) {
			throw new Error('Missing required fields for employee creation.')
		}
		// Check for duplicate email
		const existingEmployee = await prisma.employee.findFirst({
			where: { email: data.email, tenantId },
		})

		if (existingEmployee) {
			throw new Error('An employee with this email already exists.')
		}

		// Create employee
		const employee = await prisma.employee.create({
			data: { ...data, tenantId },
		})

		const accountData = {
			image: data.photo,
			tenantId,
			name: data.fullName,
			email: data.email,
			password: data.phone,
			role: data.role,
			profileId: employee.id,
		}
		// Create account to main db
		await createAccount(accountData)
		// const hashedPassword = await bcrypt.hash(data.phone, 10)
		// await prisma.account.create({
		// 	data: {
		// 		image: data.photo,
		// 		tenantId,
		// 		name: data.fullName,
		// 		email: data.email,
		// 		password: data.phone,
		// 		role: data.role,
		// 		profileId: employee.id,
		// 	},
		// })

		// Revalidate path
		revalidatePath('/dashboard/admin/employees')
		return JSON.parse(JSON.stringify(employee))
	} catch (error: any) {
		console.error('Create employee error:', error.message, error.stack)
		return {
			success: false,
			error: error.message || 'Failed to create employee',
		}
	}
}

export const getAllEmployees = async (): Promise<Employee[]> => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const employees = await prisma.employee.findMany({
			where: { tenantId },
		})
		return JSON.parse(JSON.stringify(employees))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getAllTeachers = async () => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const teachers = await prisma.employee.findMany({
			where: { role: 'teacher', tenantId },
		})
		return JSON.parse(JSON.stringify(teachers))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function deleteEmployee(id: string) {
	const prisma = await getSubdomainDB()
	try {
		const employee = await prisma.employee.delete({
			where: { id },
		})
		revalidatePath('/dashboard/admin/teachers')
		return JSON.parse(JSON.stringify(employee))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function updateEmployee(id: string, data: any) {
	const prisma = await getSubdomainDB()
	const prevEmail = await prisma.employee.findUnique({
		where: { id },
		select: { email: true },
	})
	try {
		const employee = await prisma.employee.update({
			where: { id },
			data,
		})

		//update account email if email is changed
		if (prevEmail?.email !== data.email) {
			const account = await prisma.user.findFirst({
				where: { profileId: id },
			})
			await prisma.user.update({
				where: { id: account?.id },
				data: { email: data.email },
			})
		}
		revalidatePath('/dashboard/admin/employees')
		return JSON.parse(JSON.stringify(employee))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function getEmployeeById(id: string) {
	const prisma = await getSubdomainDB()
	try {
		const employee = await prisma.employee.findUnique({
			where: { id },
		})
		return JSON.parse(JSON.stringify(employee))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
