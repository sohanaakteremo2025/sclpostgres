// features/class/repositories/prisma-class.repo.ts
import { prisma } from '@/lib/db'
import {
	CreateExamComponentPayload,
	CreateExamSchedulePayload,
	UpdateExamComponentInput,
	UpdateExamScheduleInput,
} from '@/lib/zod'

export const examScheduleDB = {
	async create(data: CreateExamSchedulePayload) {
		return await prisma.examSchedule.create({
			data,
			include: {
				exam: true,
				class: true,
				section: true,
				subject: true,
				components: true,
			},
		})
	},

	async update(id: string, data: UpdateExamScheduleInput) {
		return await prisma.examSchedule.update({
			where: { id },
			data,
			include: {
				exam: true,
				class: true,
				section: true,
				subject: true,
				components: true,
			},
		})
	},

	async delete(id: string) {
		return await prisma.examSchedule.delete({
			where: { id },
		})
	},

	async findByExamClassSection({
		examId,
		classId,
		sectionId,
		tenantId,
	}: {
		examId: string
		classId: string
		sectionId?: string
		tenantId: string
	}) {
		return await prisma.examSchedule.findMany({
			where: {
				examId,
				classId,
				sectionId: sectionId || null,
				tenantId,
			},
			include: {
				exam: true,
				class: true,
				section: true,
				subject: true,
				components: true,
				invigilators: true,
			},
		})
	},

	async deleteByExamClassSection({
		examId,
		classId,
		sectionId,
		tenantId,
	}: {
		examId: string
		classId: string
		sectionId?: string
		tenantId: string
	}) {
		return await prisma.examSchedule.deleteMany({
			where: {
				examId,
				classId,
				sectionId: sectionId || null,
				tenantId,
			},
		})
	},

	// Component methods
	async createComponent(data: CreateExamComponentPayload) {
		return await prisma.examComponent.create({
			data,
		})
	},

	async createComponentsBulk(data: CreateExamComponentPayload[]) {
		return await prisma.examComponent.createMany({
			data,
			skipDuplicates: true,
		})
	},

	async updateComponent(id: string, data: UpdateExamComponentInput) {
		return await prisma.examComponent.update({
			where: { id },
			data,
		})
	},

	async deleteComponent(id: string) {
		return await prisma.examComponent.delete({
			where: { id },
		})
	},

	async getComponents(examScheduleId: string) {
		return await prisma.examComponent.findMany({
			where: { examScheduleId },
			orderBy: { order: 'asc' },
		})
	},

	// Invigilator methods
	async connectInvigilators(examScheduleId: string, invigilatorIds: string[]) {
		if (invigilatorIds.length === 0) return null

		return await prisma.examSchedule.update({
			where: { id: examScheduleId },
			data: {
				invigilators: {
					connect: invigilatorIds.map(id => ({ id })),
				},
			},
		})
	},

	async updateInvigilators(examScheduleId: string, invigilatorIds: string[]) {
		return await prisma.examSchedule.update({
			where: { id: examScheduleId },
			data: {
				invigilators: {
					set: invigilatorIds.map(id => ({ id })),
				},
			},
		})
	},

	async disconnectAllInvigilators(examScheduleId: string) {
		return await prisma.examSchedule.update({
			where: { id: examScheduleId },
			data: {
				invigilators: {
					set: [],
				},
			},
		})
	},
}
