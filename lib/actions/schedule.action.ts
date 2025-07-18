'use server'

import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Prisma } from '@prisma/client'

export type TSchedules = Prisma.ScheduleGetPayload<{
	include: {
		subject: true
		class: true
		section: true
		teacher: true
	}
}>

export const getAllSchedules = async () => {
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId
	const prisma = await getSubdomainDB()
	try {
		const schedules = await prisma.schedule.findMany({
			where: { tenantId },
			include: {
				subject: true,
				class: true,
				section: true,
				teacher: true,
			},
		})
		return JSON.parse(JSON.stringify(schedules))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getScheduleByTeacherId = async (teacherId: string) => {
	const prisma = await getSubdomainDB()

	try {
		const schedules = await prisma.schedule.findMany({
			where: { teacherId },
			include: {
				subject: true,
				class: true,
				section: true,
				teacher: true,
			},
		})
		return JSON.parse(JSON.stringify(schedules))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
