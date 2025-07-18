'use server'
import { ResultFormSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Prisma } from '@prisma/client'

export async function createResult(data: ResultFormSchema) {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const result = await prisma.result.create({
			data: { ...data, tenantId },
		})
		revalidatePath('/dashboard/admin/results')
		return JSON.parse(JSON.stringify(result))
	} catch (error) {
		console.error('Create result error:', error)
		return { success: false, error: 'Failed to create result' }
	}
}

export async function updateResult(id: string, data: any) {
	const prisma = await getSubdomainDB()
	try {
		const result = await prisma.result.update({
			where: { id },
			data,
		})
		revalidatePath('/dashboard/admin/results')
		return JSON.parse(JSON.stringify(result))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export type TResult = Prisma.ResultGetPayload<{
	include: {
		exam: true
		student: true
		subject: true
		class: true
		section: true
	}
}>

export async function getAllResults(): Promise<TResult[]> {
	const prisma = await getSubdomainDB()
	try {
		const results = await prisma.result.findMany({
			include: {
				exam: true,
				student: true,
				subject: true,
				class: true,
				section: true,
			},
		})
		return JSON.parse(JSON.stringify(results))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function deleteResult(id: string) {
	const prisma = await getSubdomainDB()
	try {
		const result = await prisma.result.delete({ where: { id } })
		revalidatePath('/dashboard/admin/results')
		return JSON.parse(JSON.stringify(result))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function getResultByStudentId(
	studentId: string,
	classId: string,
	sectionId: string,
) {
	const prisma = await getSubdomainDB()
	try {
		const result = await prisma.result.findMany({
			where: { studentId, classId, sectionId },
		})
		return JSON.parse(JSON.stringify(result))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getResultsForStudent = async (
	examId: string,
	studentId: string,
	classId: string,
	sectionId: string,
) => {
	const prisma = await getSubdomainDB()
	try {
		const results = await prisma.result.findMany({
			where: {
				studentId,
				examId,
				classId,
				sectionId,
			},
			include: {
				exam: true,
				subject: true,
				class: true,
				section: true,
			},
		})
		return JSON.parse(JSON.stringify(results))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
