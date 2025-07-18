'use server'

import { SubjectFormSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Prisma } from '@prisma/client'

export const createSubject = async (data: SubjectFormSchema) => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const subject = await prisma.subject.create({
			data: {
				tenantId,
				name: data.name,
				classId: data.classId,
			},
		})
		const schedule = data.schedules.map((item: any) => ({
			tenantId,
			subjectId: subject.id as string,
			classId: subject.classId as string,
			teacherId: item.teacherId as string,
			sectionId: item.sectionId,
			startTime: item.startTime,
			endTime: item.endTime,
			days: item.days,
		}))
		await prisma.schedule.createMany({ data: schedule })
		revalidatePath('/dashboard/admin/subjects')
		return JSON.parse(JSON.stringify(subject))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const updateSubject = async (id: string, data: SubjectFormSchema) => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		// Start a transaction to ensure all operations succeed or fail together
		return await prisma.$transaction(async tx => {
			// Update the subject
			const subject = await tx.subject.update({
				where: { id },
				data: {
					name: data.name,
					classId: data.classId,
				},
			})

			// Delete existing schedules for this subject
			await tx.schedule.deleteMany({
				where: { subjectId: id },
			})

			// Create new schedules
			const schedules = data.schedules.map((item: any) => ({
				tenantId,
				subjectId: id,
				classId: data.classId,
				teacherId: item.teacherId,
				sectionId: item.sectionId,
				startTime: item.startTime,
				endTime: item.endTime,
				days: item.days,
			}))

			// Create the new schedules
			await tx.schedule.createMany({
				data: schedules,
			})

			revalidatePath('/dashboard/admin/subjects')
			return JSON.parse(JSON.stringify(subject))
		})
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export type TSubjectWithSchedules = Prisma.SubjectGetPayload<{
	include: {
		schedules: {
			include: {
				section: true
				teacher: true
				class: true
			}
		}
	}
}>
export const getAllSubjects = async (): Promise<TSubjectWithSchedules[]> => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const subjects = await prisma.subject.findMany({
			where: {
				tenantId,
			},
			include: {
				schedules: {
					include: {
						section: true,
						teacher: true,
						class: true,
					},
				},
			},
		})
		return JSON.parse(JSON.stringify(subjects))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const deleteSubject = async (id: string) => {
	const prisma = await getSubdomainDB()
	try {
		const subject = await prisma.subject.delete({ where: { id } })
		revalidatePath('/dashboard/admin/subjects')
		return JSON.parse(JSON.stringify(subject))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
