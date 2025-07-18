import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12)
}

export async function createUserIfNotExists(userData: {
	email: string
	password: string
	name: string
	role: string
	tenantId?: string
}) {
	const existingUser = await prisma.user.findUnique({
		where: { email: userData.email },
	})

	if (existingUser) {
		console.log(`👤 User ${userData.email} already exists, skipping...`)
		return existingUser
	}

	const hashedPassword = await hashPassword(userData.password)

	return prisma.user.create({
		data: {
			...userData,
			password: hashedPassword,
		},
	})
}

export function logProgress(step: string, details?: string) {
	const timestamp = new Date().toISOString()
	console.log(`[${timestamp}] ${step}${details ? ` - ${details}` : ''}`)
}

export async function checkTenantExists(tenantId: string) {
	const tenant = await prisma.tenant.findUnique({
		where: { id: tenantId },
	})

	if (!tenant) {
		throw new Error(
			`Tenant with ID ${tenantId} not found. Please run tenant seed first.`,
		)
	}

	return tenant
}
