import { PrismaClient } from '@prisma/client'
import { SEED_CONFIG } from './config'
import { logProgress, checkTenantExists, createUserIfNotExists } from './utils'

const prisma = new PrismaClient()

export async function seedEmployee(tenantId: string = SEED_CONFIG.TENANT_ID) {
	try {
		logProgress('👨‍🏫 Starting employee seeding')

		// Verify tenant exists
		await checkTenantExists(tenantId)

		// Create teacher user account
		const teacherUser = await createUserIfNotExists({
			...SEED_CONFIG.defaultCredentials.teacher,
			role: 'TEACHER',
			tenantId: tenantId,
		})

		// Create employee record
		const employee = await prisma.tenantEmployee.create({
			data: {
				name: 'John Teacher',
				email: 'teacher@school.com',
				phone: '+8801712345680',
				religion: 'ISLAM',
				gender: 'MALE',
				status: 'ACTIVE',
				dateOfBirth: '1985-03-20',
				address: '456 Teacher Street, Chittagong',
				designation: 'Mathematics Teacher',
				nationalId: '1234567890123',
				tenantId: tenantId,
			},
		})

		// Create salary structure
		logProgress('💼 Creating salary structure')
		const salaryStructure = await prisma.tenantSalaryStructure.create({
			data: {
				title: 'Standard Teacher Salary 2024',
				tenantId: tenantId,
			},
		})

		// Create salary items
		const salaryItems = [
			{ title: 'Basic Salary', amount: 25000.0 },
			{ title: 'House Rent', amount: 5000.0 },
			{ title: 'Transport Allowance', amount: 2000.0 },
			{ title: 'Medical Allowance', amount: 1000.0 },
		]

		for (const item of salaryItems) {
			await prisma.tenantSalaryItem.create({
				data: {
					...item,
					salaryStructureId: salaryStructure.id,
				},
			})
		}

		// Create current month salary due
		const currentDate = new Date()
		const salaryDue = await prisma.tenantSalaryDue.create({
			data: {
				amount: 33000.0, // Total of all salary items
				month: currentDate.getMonth() + 1,
				year: currentDate.getFullYear(),
				employeeId: employee.id,
			},
		})

		// Create salary due items
		for (const item of salaryItems) {
			await prisma.salaryDueItem.create({
				data: {
					title: item.title,
					amount: item.amount,
					dueId: salaryDue.id,
				},
			})
		}

		// Create shift
		await prisma.shift.upsert({
			where: { id: 'default-shift' },
			update: {},
			create: {
				id: 'default-shift',
				title: 'Morning Shift',
				startTime: 800, // 8:00 AM
				endTime: 1400, // 2:00 PM
				tenantId: tenantId,
			},
		})

		logProgress('✅ Employee seeding completed', `Employee: ${employee.name}`)
		return { employee, salaryStructure, salaryDue }
	} catch (error: any) {
		logProgress('❌ Employee seeding failed', error.message)
		throw error
	}
}
