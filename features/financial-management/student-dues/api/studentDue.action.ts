'use server'

import { CreateStudentDuePayload, UpdateStudentDueInput } from '@/lib/zod'
import {
	createStudentDueService,
	getAllStudentDuesService,
	getStudentDueByIdService,
	updateStudentDueService,
	deleteStudentDueService,
	getStudentDueByStudentIdService,
	addFeeToTargetService,
	createStudentDuesService,
	createBatchStudentDuesService,
} from '../services/studentDue.service'

import { getTenantId } from '@/lib/tenant'
import { CreateStudentDuesParams, FeeAdditionInput } from '../types/types'

export async function createStudentDue(data: CreateStudentDuePayload) {
	const tenantId = await getTenantId()

	return await createStudentDueService({ data: { ...data, tenantId } })
}

export async function getAllStudentDues() {
	const tenantId = await getTenantId()

	return await getAllStudentDuesService({
		tenantId,
	})
}

export async function getStudentDueById(id: string) {
	return await getStudentDueByIdService({
		id,
	})
}

export async function getStudentDueByStudentId(studentId: string) {
	return await getStudentDueByStudentIdService({
		studentId,
	})
}

export async function updateStudentDue(
	id: string,
	data: UpdateStudentDueInput,
) {
	return await updateStudentDueService({
		id,
		data,
	})
}

export async function deleteStudentDue(id: string) {
	return await deleteStudentDueService({
		id,
	})
}

export async function addFeeToTarget(data: FeeAdditionInput) {
	const tenantId = await getTenantId()
	return await addFeeToTargetService({ data, tenantId })
}

/**
 * Server action wrapper for creating student dues
 */
export const createStudentDuesAction = async (
	params: CreateStudentDuesParams,
) => {
	try {
		const result = await createStudentDuesService(params)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error creating student dues:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

export const createBatchStudentDuesAction = async (
	params: CreateStudentDuesParams[],
) => {
	try {
		const result = await createBatchStudentDuesService(params)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error creating batch student dues:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}
