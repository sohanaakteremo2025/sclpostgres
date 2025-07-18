// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { tenantDB } from '../db/tenant.repository'
import { CreateTenantPayload, UpdateTenantInput } from '@/lib/zod'
import { prisma } from '@/lib/db'
import { billingScheduleDB } from '@/features/cms-management/billing-schedule/db/billingSchedule.repository'
import { messageDB } from '../../message/db/message.repository'

async function createTenantService({ data }: { data: any }) {
	const { billingSchedules, messages, ...rest } = data

	return await prisma.$transaction(async tx => {
		const result = await tenantDB.create(rest)
		// add tenant id to billing schedules
		const billingSchedulesData = billingSchedules.map((schedule: any) => ({
			...schedule,
			tenantId: result.id,
		}))

		await billingScheduleDB.createManyBillingSchedule(billingSchedulesData, tx)
		// add tenant id to messages
		const messagesData = messages.map((message: any) => ({
			...message,
			tenantId: result.id,
		}))
		await messageDB.createManyMessages(messagesData)

		await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])
		return result
	})
}

async function getAllTenantsService() {
	return await nextjsCacheService.cached(() => tenantDB.getAllTenants(), {
		key: CACHE_KEYS.TENANTS.BASE,
		tags: [CACHE_KEYS.TENANTS.TAG],
		revalidate: 300, // 5 minutes
	})
}

async function updateTenantService({ id, data }: { id: string; data: any }) {
	const existing = await tenantDB.getTenantById(id)
	if (!existing) {
		throw new Error('Tenant not found')
	}

	const { billingSchedules, messages, ...rest } = data
	console.log('messages', data)

	const messagesWithTenantId = messages.map((message: any) => ({
		...message,
		tenantId: existing.id,
	}))

	await prisma.$transaction(async tx => {
		const result = await tenantDB.update(id, rest, tx)

		//update billing schedules
		await billingScheduleDB.updateManyBillingSchedule(
			billingSchedules,
			existing.id,
			tx,
		)
		await messageDB.deleteManyMessages(existing.id)
		await messageDB.createManyMessages(messagesWithTenantId)
		await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])
		return result
	})
}

async function deleteTenantService({ id }: { id: string }) {
	const existing = await tenantDB.getTenantById(id)
	if (!existing) {
		throw new Error('Tenant not found')
	}

	await tenantDB.delete(id)

	await nextjsCacheService.invalidate([CACHE_KEYS.TENANTS.TAG])
}

export const tenantService = {
	create: createTenantService,
	getAll: getAllTenantsService,
	update: updateTenantService,
	delete: deleteTenantService,
}
