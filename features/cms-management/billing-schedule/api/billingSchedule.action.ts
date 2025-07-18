'use server'

import {
	CreateTenantBillingSchedulePayload,
	UpdateTenantBillingScheduleInput,
} from '@/lib/zod'
import { billingScheduleService } from '../services/billingSchedule.service'

export async function createBillingSchedule(
	data: CreateTenantBillingSchedulePayload,
) {
	return await billingScheduleService.create({
		data,
	})
}

export async function getAllBillingSchedules() {
	return await billingScheduleService.getAll()
}

export async function updateBillingSchedule(
	id: string,
	data: UpdateTenantBillingScheduleInput,
) {
	return await billingScheduleService.update({
		id,
		data,
	})
}

export async function deleteBillingSchedule(id: string) {
	return await billingScheduleService.delete({
		id,
	})
}
