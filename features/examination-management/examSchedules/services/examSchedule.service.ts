// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { examScheduleDB } from '../db/examSchedules.repository'
import {
	CreateExamComponentPayload,
	CreateExamSchedulePayload,
	UpdateExamComponentInput,
	UpdateExamScheduleInput,
} from '@/lib/zod'
import { BulkExamScheduleFormData } from '../types'
import { prisma } from '@/lib/db'

export async function createBulkExamScheduleService({
	data,
	tenantId,
}: {
	data: BulkExamScheduleFormData
	tenantId: string
}) {
	try {
		const result = await prisma.$transaction(async tx => {
			const createdSchedules: any[] = []

			// Process each schedule
			for (const schedule of data.schedules) {
				// Create exam schedule
				const examScheduleData: CreateExamSchedulePayload = {
					examId: data.examId,
					classId: data.classId,
					sectionId: data.sectionId || undefined,
					subjectId: schedule.subjectId,
					date: new Date(schedule.date),
					startTime: schedule.startTime,
					endTime: schedule.endTime,
					room: schedule.room || undefined,
					tenantId,
				}

				const createdSchedule = await examScheduleDB.create(examScheduleData)

				// Create components
				const componentData: CreateExamComponentPayload[] =
					schedule.components.map(component => ({
						examScheduleId: createdSchedule.id,
						name: component.name,
						maxMarks: component.maxMarks,
						order: component.order,
						tenantId,
					}))

				await examScheduleDB.createComponentsBulk(componentData)

				// Connect invigilators
				if (schedule.invigilatorIds.length > 0) {
					await examScheduleDB.connectInvigilators(
						createdSchedule.id,
						schedule.invigilatorIds,
					)
				}

				createdSchedules.push(createdSchedule)
			}

			return createdSchedules
		})

		// Cache invalidation
		await nextjsCacheService.invalidate([
			CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId),
		])

		return result
	} catch (error: any) {
		console.error('Error in createBulkExamScheduleService:', error)
		throw new Error(`Failed to create bulk exam schedules: ${error.message}`)
	}
}

export async function updateBulkExamScheduleService({
	data,
	tenantId,
}: {
	data: BulkExamScheduleFormData
	tenantId: string
}) {
	try {
		const result = await prisma.$transaction(async tx => {
			const updatedSchedules: any[] = []

			// Get existing schedules for this exam/class/section
			const existingSchedules = await examScheduleDB.findByExamClassSection({
				examId: data.examId,
				classId: data.classId,
				sectionId: data.sectionId || undefined,
				tenantId,
			})

			// Create a map of existing schedules by subjectId
			const existingScheduleMap = new Map(
				existingSchedules.map(schedule => [schedule.subjectId, schedule]),
			)

			// Process each schedule in the form data
			for (const schedule of data.schedules) {
				const existingSchedule = existingScheduleMap.get(schedule.subjectId)

				if (existingSchedule) {
					// Update existing schedule
					const updateData: UpdateExamScheduleInput = {
						date: new Date(schedule.date),
						startTime: schedule.startTime,
						endTime: schedule.endTime,
						room: schedule.room || undefined,
						id: existingSchedule.id,
						examId: existingSchedule.examId,
						classId: existingSchedule.classId,
						subjectId: existingSchedule.subjectId,
						sectionId: existingSchedule.sectionId || undefined,
						tenantId,
					}

					const updatedSchedule = await examScheduleDB.update(
						existingSchedule.id,
						updateData,
					)

					// Handle components update
					await updateScheduleComponents(
						existingSchedule.id,
						schedule.components,
						tenantId,
					)

					// Handle invigilators update
					await examScheduleDB.updateInvigilators(
						existingSchedule.id,
						schedule.invigilatorIds,
					)

					updatedSchedules.push(updatedSchedule)

					// Remove from existing map as it's been processed
					existingScheduleMap.delete(schedule.subjectId)
				} else {
					// Create new schedule if it doesn't exist
					const examScheduleData = {
						examId: data.examId,
						classId: data.classId,
						sectionId: data.sectionId || undefined,
						subjectId: schedule.subjectId,
						date: new Date(schedule.date),
						startTime: schedule.startTime,
						endTime: schedule.endTime,
						room: schedule.room || undefined,
						tenantId,
					}

					const createdSchedule = await examScheduleDB.create(examScheduleData)

					// Create components
					const componentData: CreateExamComponentPayload[] =
						schedule.components.map(component => ({
							examScheduleId: createdSchedule.id,
							name: component.name,
							maxMarks: component.maxMarks,
							order: component.order,
							tenantId,
						}))

					await examScheduleDB.createComponentsBulk(componentData)

					// Connect invigilators
					if (schedule.invigilatorIds.length > 0) {
						await examScheduleDB.connectInvigilators(
							createdSchedule.id,
							schedule.invigilatorIds,
						)
					}

					updatedSchedules.push(createdSchedule)
				}
			}

			// Delete schedules that are no longer in the form data
			const schedulesToDelete = Array.from(existingScheduleMap.values())
			for (const scheduleToDelete of schedulesToDelete) {
				await examScheduleDB.delete(scheduleToDelete.id)
			}

			return {
				updatedSchedules,
				deletedCount: schedulesToDelete.length,
				totalProcessed: data.schedules.length,
			}
		})

		// Cache invalidation
		await nextjsCacheService.invalidate([
			CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId),
		])

		return result
	} catch (error: any) {
		console.error('Error in updateBulkExamScheduleService:', error)
		throw new Error(`Failed to update bulk exam schedules: ${error.message}`)
	}
}

// Helper function to update schedule components
async function updateScheduleComponents(
	examScheduleId: string,
	newComponents: Array<{
		name: string
		maxMarks: number
		order: number
	}>,
	tenantId: string,
) {
	// Get existing components
	const existingComponents = await examScheduleDB.getComponents(examScheduleId)

	// Create a map of existing components by name
	const existingComponentMap = new Map(
		existingComponents.map(component => [component.name, component]),
	)

	// Process new components
	for (const component of newComponents) {
		const existingComponent = existingComponentMap.get(component.name)

		if (existingComponent) {
			// Update existing component
			const updateData: UpdateExamComponentInput = {
				name: component.name,
				maxMarks: component.maxMarks,
				order: component.order,
				tenantId,
				id: existingComponent.id,
				examScheduleId: existingComponent.examScheduleId,
			}

			await examScheduleDB.updateComponent(existingComponent.id, updateData)

			// Remove from existing map as it's been processed
			existingComponentMap.delete(component.name)
		} else {
			// Create new component
			const componentData: CreateExamComponentPayload = {
				examScheduleId,
				name: component.name,
				maxMarks: component.maxMarks,
				order: component.order,
				tenantId,
			}

			await examScheduleDB.createComponent(componentData)
		}
	}

	// Delete components that are no longer needed
	const componentsToDelete = Array.from(existingComponentMap.values())
	for (const componentToDelete of componentsToDelete) {
		await examScheduleDB.deleteComponent(componentToDelete.id)
	}
}

export async function replaceBulkExamScheduleService({
	data,
	tenantId,
}: {
	data: BulkExamScheduleFormData
	tenantId: string
}) {
	try {
		const result = await prisma.$transaction(async tx => {
			// Delete all existing schedules for this exam/class/section
			await examScheduleDB.deleteByExamClassSection({
				examId: data.examId,
				classId: data.classId,
				sectionId: data.sectionId || undefined,
				tenantId,
			})

			// Create all new schedules
			const createdSchedules: any[] = []

			for (const schedule of data.schedules) {
				const examScheduleData = {
					examId: data.examId,
					classId: data.classId,
					sectionId: data.sectionId || undefined,
					subjectId: schedule.subjectId,
					date: new Date(schedule.date),
					startTime: schedule.startTime,
					endTime: schedule.endTime,
					room: schedule.room || undefined,
					tenantId,
				}

				const createdSchedule = await examScheduleDB.create(examScheduleData)

				// Create components
				const componentData: CreateExamComponentPayload[] =
					schedule.components.map(component => ({
						examScheduleId: createdSchedule.id,
						name: component.name,
						maxMarks: component.maxMarks,
						order: component.order,
						tenantId,
					}))

				await examScheduleDB.createComponentsBulk(componentData)

				// Connect invigilators
				if (schedule.invigilatorIds.length > 0) {
					await examScheduleDB.connectInvigilators(
						createdSchedule.id,
						schedule.invigilatorIds,
					)
				}

				createdSchedules.push(createdSchedule)
			}

			return {
				createdSchedules,
				totalCreated: createdSchedules.length,
			}
		})

		// Cache invalidation
		await nextjsCacheService.invalidate([
			CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId),
		])

		return result
	} catch (error: any) {
		console.error('Error in replaceBulkExamScheduleService:', error)
		throw new Error(`Failed to replace bulk exam schedules: ${error.message}`)
	}
}

// Individual schedule creation service (for backwards compatibility)
export async function createExamScheduleService({
	data,
	tenantId,
}: {
	data: any
	tenantId: string
}) {
	try {
		const result = await prisma.$transaction(async tx => {
			// Create exam schedule
			const examScheduleData: CreateExamSchedulePayload = {
				examId: data.examId,
				classId: data.classId,
				sectionId: data.sectionId || undefined,
				subjectId: data.subjectId,
				date: new Date(data.date),
				startTime: data.startTime,
				endTime: data.endTime,
				room: data.room || undefined,
				tenantId,
			}

			const createdSchedule = await examScheduleDB.create(examScheduleData)

			// Create components
			if (data.components && data.components.length > 0) {
				const componentData: CreateExamComponentPayload[] = data.components.map(
					(component: any) => ({
						examScheduleId: createdSchedule.id,
						name: component.name,
						maxMarks: component.maxMarks,
						order: component.order,
						tenantId,
					}),
				)

				await examScheduleDB.createComponentsBulk(componentData)
			}

			// Connect invigilators
			if (data.invigilatorIds && data.invigilatorIds.length > 0) {
				await examScheduleDB.connectInvigilators(
					createdSchedule.id,
					data.invigilatorIds,
				)
			}

			return createdSchedule
		})

		// Cache invalidation
		await nextjsCacheService.invalidate([
			CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId),
		])

		return result
	} catch (error: any) {
		console.error('Error in createExamScheduleService:', error)
		throw new Error(`Failed to create exam schedule: ${error.message}`)
	}
}

export async function updateSubjectScheduleService({ data }: { data: any }) {
	try {
		const result = await prisma.$transaction(async tx => {
			await examScheduleDB.update(data.id, data)
		})

		return result
	} catch (error: any) {
		console.error('Error in updateSubjectScheduleService:', error)
		throw new Error(`Failed to update exam schedule: ${error.message}`)
	}
}

export async function deleteExamScheduleService({
	id,
	tenantId,
}: {
	id: string
	tenantId: string
}) {
	try {
		const result = await examScheduleDB.delete(id)
		await nextjsCacheService.invalidate([
			CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId),
		])
		return result
	} catch (error: any) {
		console.error('Error in deleteExamScheduleService:', error)
		throw new Error(`Failed to delete exam schedule: ${error.message}`)
	}
}
