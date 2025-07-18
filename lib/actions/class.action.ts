'use server'

import { CreateClassInput, UpdateClassInput } from '@/schemas/class'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import {
	CACHE_KEYS,
	createCachedAction,
	revalidateCachedData,
} from '../cache-actions'
import { getCachedTenantIdByDomain } from './tanant'
import { ServerActionError, ServerActionResponse } from '@/utils/promiseToast'

export const createClass = async (
	data: CreateClassInput,
	domain: string,
): Promise<ServerActionResponse> => {
	const tenantId = await getCachedTenantIdByDomain(domain)
	if (!tenantId) {
		throw new Error('School not found')
	}
	try {
		const newClass = await prisma.class.create({
			data: {
				tenantId,
				name: data.name,
			},
		})

		revalidateCachedData(
			[CACHE_KEYS.CLASSES.TAG],
			[CACHE_KEYS.CLASSES.BASE(domain)],
		)
		return {
			message: 'Class created successfully',
			data: newClass,
			success: true,
		}
	} catch (error) {
		throw new ServerActionError('failed to create class', 500)
	}
}

export const updateClass = async (
	classId: string,
	data: UpdateClassInput,
): Promise<ServerActionResponse> => {
	try {
		// 1. Update the class details
		const updatedClass = await prisma.class.update({
			where: { id: classId },
			data,
		})

		// 4. Revalidate the page
		revalidateCachedData([CACHE_KEYS.CLASSES.TAG], ['/admin/classes'])

		return {
			message: 'Class updated successfully',
			data: updatedClass,
			success: true,
		}
	} catch (error) {
		throw new Error('failed to update class')
	}
}

export type GetClassesActionType = Prisma.ClassGetPayload<{
	include: {
		sections: true
	}
}>

export const getClasses = async (
	domain: string,
): Promise<GetClassesActionType[]> => {
	const tenantId = await getCachedTenantIdByDomain(domain)
	if (!tenantId) {
		throw new Error('Tenant not found')
	}
	try {
		const classes = await prisma.class.findMany({
			where: { tenantId },
			include: {
				sections: true,
			},
		})
		return classes
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : 'Failed to fetch classes',
		)
	}
}

export const getCachedClasses = async (domain: string) =>
	createCachedAction(getClasses, {
		cacheKey: CACHE_KEYS.CLASSES.BASE(domain),
		tags: [CACHE_KEYS.CLASSES.TAG],
		revalidate: 3600,
	})(domain)

export const getClassById = async (id: string) => {
	try {
		const classRoom = await prisma.class.findUnique({
			where: { id },
		})
		return classRoom
	} catch (error) {
		throw new Error('failed to fetch class')
	}
}

export const deleteClass = async (id: string) => {
	try {
		const classRoom = await prisma.class.delete({ where: { id } })
		revalidateCachedData([CACHE_KEYS.CLASSES.TAG], ['/admin/classes'])
		return {
			message: 'Class deleted successfully',
			data: classRoom,
			success: true,
		}
	} catch (error) {
		throw new Error('failed to delete class')
	}
}
