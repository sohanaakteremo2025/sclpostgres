//tenantDB
import { prisma } from '@/lib/db'
import {
	CreateTenantBillingSchedulePayload,
	UpdateTenantBillingScheduleInput,
} from '@/lib/zod'
import { TransactionClient } from '@/types'

async function create(data: CreateTenantBillingSchedulePayload) {
	return await prisma.tenantBillingSchedule.create({ data })
}

async function createManyBillingSchedule(
	data: CreateTenantBillingSchedulePayload[],
	tx?: TransactionClient,
) {
	const client = tx || prisma
	return await client.tenantBillingSchedule.createMany({ data })
}

async function updateManyBillingSchedule(
	data: UpdateTenantBillingScheduleInput[],
	tenantId: string,
	tx?: TransactionClient,
) {
	const client = tx || prisma

	return await Promise.all(
		data.map(async item => {
			// If item has an id, update it; otherwise, create it
			if (item.id) {
				return client.tenantBillingSchedule.upsert({
					where: { id: item.id },
					update: {
						label: item.label,
						billingType: item.billingType,
						amount: item.amount,
						frequency: item.frequency,
						nextDueDate: item.nextDueDate,
						status: item.status,
					},
					create: {
						id: item.id,
						label: item.label,
						billingType: item.billingType,
						amount: item.amount,
						frequency: item.frequency,
						nextDueDate: item.nextDueDate,
						status: item.status,
						tenantId: tenantId,
					},
				})
			} else {
				// Create new record without id (let DB generate it)
				return client.tenantBillingSchedule.create({
					data: {
						label: item.label,
						billingType: item.billingType,
						amount: item.amount,
						frequency: item.frequency,
						nextDueDate: item.nextDueDate,
						status: item.status,
						tenantId: tenantId,
					},
				})
			}
		}),
	)
}
async function update(id: string, data: UpdateTenantBillingScheduleInput) {
	return await prisma.tenantBillingSchedule.update({ where: { id }, data })
}

async function deleteBillingSchedule(id: string) {
	return await prisma.tenantBillingSchedule.delete({ where: { id } })
}

async function getAllBillingSchedules() {
	return await prisma.tenantBillingSchedule.findMany({
		orderBy: { createdAt: 'asc' },
	})
}

async function getBillingScheduleById(id: string) {
	return await prisma.tenantBillingSchedule.findUnique({ where: { id } })
}

export const billingScheduleDB = {
	create,
	createManyBillingSchedule,
	updateManyBillingSchedule,
	update,
	delete: deleteBillingSchedule,
	getAllBillingSchedules,
	getBillingScheduleById,
}
