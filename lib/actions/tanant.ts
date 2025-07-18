// app/actions/tenant.ts
'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { TenantFormSchema } from '@/app/cms/tenants/list/types'
import { Prisma } from '@prisma/client'
import { createCachedAction, revalidateCachedData } from '../cache-actions'
import { hashPassword } from '@/utils/hash-password'
import { ActionResponse } from '@/types/api'
import {
	CreateTenantAdminInput,
	UpdateTenantAdminInput,
} from '@/schemas/tenant.admin.schema'
import { CACHE_KEYS } from '@/constants/cache'

export type GetTenantsResponseType = Prisma.TenantGetPayload<{
	include: {
		billingSchedules: true
		students: {
			select: { id: true }
		}
		messages: true
	}
}>
// Get all tenants
export async function getTenants(): Promise<GetTenantsResponseType[]> {
	try {
		// Get tenants
		const tenants = await prisma.tenant.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				billingSchedules: true,
				messages: true,
				students: {
					select: { id: true },
				},
			},
		})
		return tenants
	} catch (error) {
		console.error('Error fetching tenants:', error)
		throw new Error('Failed to fetch tenants')
	}
}

export const getCachedTenants = createCachedAction(getTenants, {
	cacheKey: CACHE_KEYS.TENANTS.BASE,
	tags: [CACHE_KEYS.TENANTS.TAG],
	revalidate: 3600,
})

// Get a single tenant
export async function getTenant(id: string) {
	try {
		return await prisma.tenant.findUnique({
			where: { id },
			include: {
				billingSchedules: true,
				messages: true,
				students: {
					select: { id: true },
				},
			},
		})
	} catch (error) {
		console.error('Error fetching tenant:', error)
		throw new Error('Failed to fetch tenant')
	}
}

// get tenant by domain
export async function getTenantByDomain(domain: string) {
	try {
		return await prisma.tenant.findUnique({
			where: { domain },
			include: {
				messages: true,
				notices: true,
				students: true,
				employees: true,
				classes: true,
				exams: true,
				feeStructures: true,
			},
		})
	} catch (error) {
		console.error('Error fetching tenant:', error)
		throw new Error('Failed to fetch tenant')
	}
}

export const getCachedTenantByDomain = async (domain: string) =>
	createCachedAction(getTenantByDomain, {
		cacheKey: CACHE_KEYS.TENANT_BY_DOMAIN.BASE(domain),
		tags: [CACHE_KEYS.TENANT_BY_DOMAIN.TAG],
		revalidate: 3600,
	})(domain)

export async function getTenantLogoByDomain(domain: string) {
	try {
		return await prisma.tenant.findUnique({
			where: { domain },
			select: { logo: true, name: true },
		})
	} catch (error) {
		console.error('Error fetching tenant:', error)
		throw new Error('Failed to fetch tenant')
	}
}

export const getCachedTenantLogoByDomain = async (domain: string) =>
	createCachedAction(getTenantLogoByDomain, {
		cacheKey: CACHE_KEYS.TENANT_BY_DOMAIN.BASE(domain),
		tags: [CACHE_KEYS.TENANT_BY_DOMAIN.TAG],
		revalidate: 3600,
	})(domain)

//get tenant id by domain
export async function getTenantIdByDomain(domain: string) {
	try {
		const tenant = await prisma.tenant.findUnique({
			where: { domain },
			select: { id: true },
		})
		return tenant?.id
	} catch (error) {
		console.error('Error fetching tenant:', error)
		throw new Error('Failed to fetch tenant')
	}
}

export const getCachedTenantIdByDomain = async (domain: string) =>
	createCachedAction(getTenantIdByDomain, {
		cacheKey: CACHE_KEYS.TENANT_ID_BY_DOMAIN.BASE(domain),
		tags: [CACHE_KEYS.TENANT_ID_BY_DOMAIN.TAG],
		revalidate: 3600,
	})(domain)

/**
 * Creates a new tenant with associated billing schedules and messages
 * @param data The tenant data from the form
 * @returns Object containing success status and tenant ID or error message
 */
export async function createTenant(data: TenantFormSchema) {
	try {
		// First create the tenant
		const tenant = await prisma.tenant.create({
			data: {
				logo: data.logo,
				name: data.name,
				email: data.email,
				phone: data.phone,
				address: data.address,
				domain: data.domain,
				status: data.status,
			},
		})

		// Then create the billing schedules
		if (data.billingSchedules && data.billingSchedules.length > 0) {
			await prisma.tenantBillingSchedule.createMany({
				data: data.billingSchedules.map(schedule => ({
					tenantId: tenant.id,
					label: schedule.label,
					frequency: schedule.frequency,
					fixedAmount:
						schedule.fixedAmount !== null ? schedule.fixedAmount : null,
					perStudentFee:
						schedule.perStudentFee !== null ? schedule.perStudentFee : null,
					nextDueDate: schedule.nextDueDate,
					lastPaidDate: schedule.lastPaidDate || null,
					isActive: schedule.isActive,
				})),
			})
		}

		// Finally create the messages
		if (data.messages && data.messages.length > 0) {
			await prisma.tenantMessage.createMany({
				data: data.messages.map(message => ({
					tenantId: tenant.id,
					author: message.author,
					title: message.title,
					message: message.message,
					photo: message.photo || null,
				})),
			})
		}

		// Revalidate the path to update the UI
		revalidateCachedData([CACHE_KEYS.TENANTS.TAG, CACHE_KEYS.CMS_DASHBOARD.TAG])
		return {
			success: true,
			tenantId: tenant.id,
		}
	} catch (error) {
		console.error('Error creating tenant:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'An error occurred while creating the tenant',
		}
	}
}

/**
 * Updates an existing tenant with associated billing schedules and messages
 * @param tenantId The ID of the tenant to update
 * @param data The updated tenant data from the form
 * @returns Object containing success status and tenant ID or error message
 */
export async function updateTenant(tenantId: string, data: TenantFormSchema) {
	try {
		// First update the tenant
		const tenant = await prisma.tenant.update({
			where: { id: tenantId },
			data: {
				logo: data.logo,
				name: data.name,
				email: data.email,
				phone: data.phone,
				address: data.address,
				domain: data.domain,
				status: data.status,
			},
		})

		// Delete existing billing schedules and recreate them
		await prisma.tenantBillingSchedule.deleteMany({
			where: {
				tenantId,
			},
		})

		if (data.billingSchedules && data.billingSchedules.length > 0) {
			await prisma.tenantBillingSchedule.createMany({
				data: data.billingSchedules.map(schedule => ({
					tenantId: tenant.id,
					label: schedule.label,
					frequency: schedule.frequency,
					fixedAmount:
						schedule.fixedAmount !== null ? schedule.fixedAmount : null,
					perStudentFee:
						schedule.perStudentFee !== null ? schedule.perStudentFee : null,
					nextDueDate: schedule.nextDueDate,
					lastPaidDate: schedule.lastPaidDate || null,
					isActive: schedule.isActive,
				})),
			})
		}

		// Delete existing messages and recreate them
		await prisma.tenantMessage.deleteMany({
			where: {
				tenantId,
			},
		})

		if (data.messages && data.messages.length > 0) {
			await prisma.tenantMessage.createMany({
				data: data.messages.map(message => ({
					tenantId: tenant.id,
					author: message.author,
					title: message.title,
					message: message.message,
					photo: message.photo || null,
				})),
			})
		}

		// Revalidate the path to update the UI
		revalidateCachedData([CACHE_KEYS.TENANTS.TAG, CACHE_KEYS.CMS_DASHBOARD.TAG])

		return {
			success: true,
			tenantId: tenant.id,
		}
	} catch (error) {
		console.error('Error updating tenant:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'An error occurred while updating the tenant',
		}
	}
}

/**
 * Get all tenants with their billing schedules and messages
 * @returns Array of all tenants with their related data
 */
export async function getAllTenants() {
	try {
		const tenants = await prisma.tenant.findMany({
			include: {
				billingSchedules: true,
				messages: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return tenants
	} catch (error) {
		console.error('Error fetching tenants:', error)
		throw error
	}
}

// Delete tenant
export async function deleteTenant(id: string) {
	const session = await auth()
	if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
		throw new Error('Unauthorized')
	}

	try {
		await prisma.tenant.delete({
			where: { id },
		})

		revalidateCachedData([CACHE_KEYS.TENANTS.TAG, CACHE_KEYS.CMS_DASHBOARD.TAG])
		return { success: true }
	} catch (error) {
		console.error('Error deleting tenant:', error)
		return {
			success: false,
			error: 'Failed to delete tenant. Make sure there are no dependencies.',
		}
	}
}

// Toggle tenant status
export async function toggleTenantStatus(id: string) {
	const session = await auth()
	if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
		throw new Error('Unauthorized')
	}

	try {
		// Get current status
		const tenant = await prisma.tenant.findUnique({
			where: { id },
			select: { status: true },
		})

		if (!tenant) {
			throw new Error('Tenant not found')
		}

		// Toggle status
		const newStatus = tenant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

		await prisma.tenant.update({
			where: { id },
			data: { status: newStatus },
		})

		revalidateCachedData([CACHE_KEYS.TENANTS.TAG, CACHE_KEYS.CMS_DASHBOARD.TAG])
		return { success: true, status: newStatus }
	} catch (error) {
		console.error('Error toggling tenant status:', error)
		return { success: false, error: 'Failed to update tenant status' }
	}
}

/**
 * Create a new tenant admin
 */
export async function createTenantAdmin(data: CreateTenantAdminInput) {
	try {
		// Check if email already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		})

		if (existingUser) {
			throw new Error('Email already in use')
		}

		// Hash password
		const hashedPassword = await hashPassword(data.password)

		// Create user
		const newAdmin = await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				password: hashedPassword,
				photo: data.photo || null,
				role: data.role,
				tenantId: data.tenantId,
				status: 'ACTIVE',
			},
			include: {
				tenant: true,
			},
		})
		revalidateCachedData([CACHE_KEYS.ADMIN.TAG])
		return { success: true, data: newAdmin }
	} catch (error) {
		console.error('Failed to create tenant admin:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to create tenant admin',
		}
	}
}

/**
 * Update an existing tenant admin
 */
export async function updateTenantAdmin(
	id: string,
	data: UpdateTenantAdminInput,
) {
	try {
		console.log(data)
		// Validate user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) {
			throw new Error('Admin not found')
		}

		// Prepare update data
		const updateData: any = {
			name: data.name,
			email: data.email,
			role: data.role,
			tenantId: data.tenantId,
			photo: data.photo || existingUser.photo,
		}

		// Only update password if provided
		if (data.password && data.password.trim() !== '') {
			updateData.password = await hashPassword(data.password)
		}

		// Update user
		const updatedAdmin = await prisma.user.update({
			where: { id },
			data: updateData,
			include: {
				tenant: true,
			},
		})

		revalidateCachedData([CACHE_KEYS.ADMIN.TAG])
		return { success: true, data: updatedAdmin }
	} catch (error) {
		console.error('Failed to update tenant admin:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to update tenant admin',
		}
	}
}

/**
 * Delete a tenant admin
 */
export async function deleteTenantAdmin(id: string) {
	try {
		// Validate user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) {
			throw new Error('Admin not found')
		}

		// Delete user
		await prisma.user.delete({
			where: { id },
		})

		revalidateCachedData([CACHE_KEYS.ADMIN.TAG])
		return { success: true }
	} catch (error) {
		console.error('Failed to delete tenant admin:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to delete tenant admin',
		}
	}
}

/**
 * Update tenant admin status (activate/deactivate)
 */
export async function updateTenantAdminStatus(
	id: string,
	status: 'ACTIVE' | 'INACTIVE',
) {
	try {
		// Validate user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) {
			throw new Error('Admin not found')
		}

		// Update status
		const updatedAdmin = await prisma.user.update({
			where: { id },
			data: { status },
			include: {
				tenant: true,
			},
		})

		revalidateCachedData([CACHE_KEYS.ADMIN.TAG])
		return { success: true, data: updatedAdmin }
	} catch (error) {
		console.error('Failed to update tenant admin status:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to update admin status',
		}
	}
}

/**
 * List all tenant admins
 */
export type GetAdminsResponseType = Prisma.UserGetPayload<{
	include: {
		tenant: true
	}
}>
export async function getAdmins(): Promise<
	ActionResponse<GetAdminsResponseType[]>
> {
	try {
		const admins = await prisma.user.findMany({
			where: { role: 'ADMIN' },
			include: {
				tenant: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return {
			success: true,
			data: admins,
			message: 'Admins fetched successfully',
		}
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to list tenant admins',
			message: 'Failed to list tenant admins',
		}
	}
}

export const getCachedAdmins = createCachedAction(getAdmins, {
	cacheKey: CACHE_KEYS.ADMIN.BASE,
	tags: [CACHE_KEYS.ADMIN.TAG],
	revalidate: 3600,
})
