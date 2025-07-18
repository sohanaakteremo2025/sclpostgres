'use server'

import { getPrismaClient } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { parseHostname } from '@/utils/parseHostname'
import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'
const prisma = getPrismaClient()

export async function createTenant(data: any) {
	const { quotes, ...rest } = data
	try {
		// Use Prisma's $transaction for atomicity
		const result = await prisma.$transaction(async prisma => {
			// Create the tenant
			const tenant = await prisma.tenant.create({
				data: rest,
			})

			// Prepare quotes with tenantId
			const allQuotes = quotes.map((quote: any) => ({
				...quote,
				tenantId: tenant.id,
			}))

			// Create quotes
			await prisma.quote.createMany({ data: allQuotes })

			console.log('Tenant Create: ', tenant)
			// Hash the password and create the admin account
			// const hashedPassword = await bcrypt.hash(password, 10)
			// await prisma.account.create({
			// 	data: {
			// 		name: data.name,
			// 		email: data.email,
			// 		password: hashedPassword,
			// 		role: 'admin',
			// 		tenantId: tenant.id,
			// 	},
			// })

			// Return the created tenant
			// console.log('Tenant Create: ', tenant)
			return tenant
		})

		// Revalidate the tenant list page
		revalidatePath('/cms/tenants/list')

		// Return the tenant data
		return JSON.parse(JSON.stringify(result))
	} catch (error) {
		// Handle any errors
		console.error('Error creating tenant:', error)
		// throw new Error('Failed to create tenant')
		return JSON.parse(JSON.stringify(error))
	}
}

//update tenant by id
export async function updateTenant(id: string, data: any) {
	const { quotes, ...rest } = data
	try {
		const result = await prisma.$transaction(async prisma => {
			// Update the tenant
			const tenant = await prisma.tenant.update({
				where: { id },
				data: rest,
			})

			// Prepare quotes with tenantId
			const allQuotes = quotes.map((quote: any) => ({
				...quote,
				tenantId: tenant.id,
			}))

			// Update quotes
			await prisma.quote.deleteMany({ where: { tenantId: id } })
			await prisma.quote.createMany({ data: allQuotes })

			// Return the updated tenant
			return tenant
		})
		revalidatePath('/cms/tenants/list')
		return JSON.parse(JSON.stringify(result))
	} catch (error) {
		console.error('Error updating tenant:', error)
		throw new Error('Failed to update tenant')
	}
}

export type TGetTenantByDomain = Prisma.TenantGetPayload<{
	include: { quotes: true; notice: true }
}>

// get tenant by domain
export async function getTenantByDomain(): Promise<TGetTenantByDomain> {
	const { currentHost: domain } = parseHostname(
		(await headers()).get('host') || '',
	)
	const tenant = await prisma.tenant.findUnique({
		where: { domain },
		include: { quotes: true, notice: true },
	})
	return JSON.parse(JSON.stringify(tenant))
}

// Delete a tenant
export async function deleteTenant(id: string) {
	try {
		await prisma.tenant.delete({
			where: { id },
		})
		revalidatePath('/cms/tenants/list')
	} catch (error) {
		console.error('Error deleting tenant:', error)
		throw new Error('Failed to delete tenant')
	}
}

export type TTenants = Prisma.TenantGetPayload<{
	include: { quotes: true }
}>
// List all tenants
export async function listTenants() {
	return await prisma.tenant.findMany({
		include: { quotes: true },
	})
}

export type TTenanatAdmin = Prisma.UserGetPayload<{
	include: { tenant: true }
}>
// get all tenants admins
export async function getAllTenantAdmins() {
	try {
		const admins = await prisma.user.findMany({
			where: { tenantId: { not: null }, role: 'admin' },
			include: { tenant: true },
		})
		return JSON.parse(JSON.stringify(admins))
	} catch (error) {
		console.error('Error fetching tenant admins:', error)
		throw new Error('Failed to fetch tenant admins')
	}
}

// get tenant by id
export async function getTenantById(id: string) {
	return await prisma.tenant.findUnique({
		where: { id },
	})
}

//get quotes by tenant id
export async function getQuotesByTenantId(tenantId: string) {
	return await prisma.quote.findMany({
		where: { tenantId },
	})
}
