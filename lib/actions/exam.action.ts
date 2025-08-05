'use server'

import { getTenantId } from '@/lib/tenant'
import { ExamFormSchema } from '@/lib/zod'
import { Exam } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getSubdomainDB } from '../getSubdomainDB'
import { getCurrentUser } from './auth.action'

export const createExam = async (data: ExamFormSchema) => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const exam = await prisma.exam.create({
			data: { ...data, tenantId },
		})
		revalidatePath('/dashboard/admin/exams')
		return JSON.parse(JSON.stringify(exam))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const updateExam = async (id: string, data: ExamFormSchema) => {
	const prisma = await getSubdomainDB()
	try {
		return await prisma.$transaction(async tx => {
			const exam = await tx.exam.update({
				where: { id },
				data: {
					title: data.name,
					marks: data.marks,
					year: data.year,
				},
			})
			revalidatePath('/dashboard/admin/exams')
			return JSON.parse(JSON.stringify(exam))
		})
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getAllExams = async (): Promise<Exam[]> => {
	const tenantId = await getTenantId()
	const prisma = await getSubdomainDB()
	try {
		const exams = await prisma.exam.findMany({
			where: { tenantId },
		})
		return JSON.parse(JSON.stringify(exams))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getExamByYear = async (year: string) => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const exams = await prisma.exam.findMany({ where: { year, tenantId } })
		return JSON.parse(JSON.stringify(exams))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const deleteExam = async (id: string) => {
	const prisma = await getSubdomainDB()
	try {
		const exam = await prisma.exam.delete({ where: { id } })
		revalidatePath('/dashboard/admin/exams')
		return JSON.parse(JSON.stringify(exam))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
