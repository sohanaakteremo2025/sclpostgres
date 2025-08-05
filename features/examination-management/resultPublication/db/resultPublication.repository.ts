import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import type {
	BulkResultEntryFormData,
	ResultPublicationFilters,
	StudentResultFilters,
} from '../types'

// Repository for result publications
export const resultPublicationDB = {
	// Create or update result publication
	async upsertResultPublication(data: {
		examScheduleId: string
		isPublished: boolean
		publishedAt?: Date
		publishedBy?: string
		tenantId: string
	}) {
		return await prisma.resultPublish.upsert({
			where: {
				examScheduleId: data.examScheduleId,
			},
			create: {
				examScheduleId: data.examScheduleId,
				isPublished: data.isPublished,
				publishedAt: data.publishedAt,
				publishedBy: data.publishedBy,
				tenantId: data.tenantId,
			},
			update: {
				isPublished: data.isPublished,
				publishedAt: data.publishedAt,
				publishedBy: data.publishedBy,
			},
			include: {
				examSchedule: {
					include: {
						exam: {
							include: {
								examType: true,
								session: true,
							},
						},
						class: true,
						section: true,
						subject: true,
						components: {
							orderBy: { order: 'asc' },
						},
					},
				},
			},
		})
	},

	// Find result publications with filters
	async findManyWithFilters({
		filters,
		tenantId,
		skip,
		take,
		orderBy,
	}: {
		filters: ResultPublicationFilters
		tenantId: string
		skip?: number
		take?: number
		orderBy?: Prisma.ResultPublishOrderByWithRelationInput[]
	}) {
		const whereClause: Prisma.ResultPublishWhereInput = {
			tenantId,
		}

		if (filters.isPublished !== undefined) {
			whereClause.isPublished = filters.isPublished
		}

		if (
			filters.examId ||
			filters.classId ||
			filters.sectionId ||
			filters.sessionId ||
			filters.subjectId
		) {
			whereClause.examSchedule = {}

			if (filters.classId) {
				whereClause.examSchedule.classId = filters.classId
			}

			if (filters.sectionId) {
				whereClause.examSchedule.sectionId = filters.sectionId
			}

			if (filters.subjectId) {
				whereClause.examSchedule.subjectId = filters.subjectId
			}

			if (filters.examId || filters.sessionId) {
				whereClause.examSchedule.exam = {}

				if (filters.examId) {
					whereClause.examSchedule.exam.id = filters.examId
				}

				if (filters.sessionId) {
					whereClause.examSchedule.exam.sessionId = filters.sessionId
				}
			}
		}

		return await prisma.resultPublish.findMany({
			where: whereClause,
			include: {
				examSchedule: {
					include: {
						exam: {
							include: {
								examType: true,
								session: true,
							},
						},
						class: true,
						section: true,
						subject: true,
						components: {
							orderBy: { order: 'asc' },
						},
						results: {
							include: {
								student: {
									select: {
										id: true,
										name: true,
										roll: true,
									},
								},
							},
						},
						_count: {
							select: {
								results: true,
							},
						},
					},
				},
			},
			skip,
			take,
			orderBy: orderBy || [
				{
					examSchedule: {
						exam: {
							startDate: 'desc',
						},
					},
				},
				{
					publishedAt: 'desc',
				},
			],
		})
	},

	// Count result publications with filters
	async countWithFilters({
		filters,
		tenantId,
	}: {
		filters: ResultPublicationFilters
		tenantId: string
	}) {
		const whereClause: Prisma.ResultPublishWhereInput = {
			tenantId,
		}

		if (filters.isPublished !== undefined) {
			whereClause.isPublished = filters.isPublished
		}

		if (
			filters.examId ||
			filters.classId ||
			filters.sectionId ||
			filters.sessionId ||
			filters.subjectId
		) {
			whereClause.examSchedule = {}

			if (filters.classId) {
				whereClause.examSchedule.classId = filters.classId
			}

			if (filters.sectionId) {
				whereClause.examSchedule.sectionId = filters.sectionId
			}

			if (filters.subjectId) {
				whereClause.examSchedule.subjectId = filters.subjectId
			}

			if (filters.examId || filters.sessionId) {
				whereClause.examSchedule.exam = {}

				if (filters.examId) {
					whereClause.examSchedule.exam.id = filters.examId
				}

				if (filters.sessionId) {
					whereClause.examSchedule.exam.sessionId = filters.sessionId
				}
			}
		}

		return await prisma.resultPublish.count({
			where: whereClause,
		})
	},

	// Find by exam schedule ID
	async findByExamScheduleId(examScheduleId: string, tenantId: string) {
		return await prisma.resultPublish.findFirst({
			where: {
				examScheduleId,
				tenantId,
			},
			include: {
				examSchedule: {
					include: {
						exam: {
							include: {
								examType: true,
								session: true,
							},
						},
						class: true,
						section: true,
						subject: true,
						components: {
							orderBy: { order: 'asc' },
						},
						results: {
							include: {
								student: {
									select: {
										id: true,
										name: true,
										roll: true,
										photo: true,
									},
								},
								componentResults: {
									include: {
										examComponent: true,
									},
									orderBy: {
										examComponent: {
											order: 'asc',
										},
									},
								},
							},
							orderBy: {
								student: {
									roll: 'asc',
								},
							},
						},
					},
				},
			},
		})
	},

	// Delete result publication
	async deleteById(id: string, tenantId: string) {
		return await prisma.resultPublish.delete({
			where: {
				id,
				tenantId,
			},
		})
	},
}

// Repository for exam results
export const examResultDB = {
	// Create bulk results with transaction
	async createBulkResults({
		examScheduleId,
		results,
		tenantId,
	}: {
		examScheduleId: string
		results: BulkResultEntryFormData['results']
		tenantId: string
	}) {
		return await prisma.$transaction(async tx => {
			const createdResults = []

			for (const studentResult of results) {
				// Delete existing results for this student and exam
				await tx.examResult.deleteMany({
					where: {
						examScheduleId,
						studentId: studentResult.studentId,
					},
				})

				await tx.examComponentResult.deleteMany({
					where: {
						examComponent: {
							examScheduleId,
						},
						studentId: studentResult.studentId,
					},
				})

				// Create component results first
				const componentResults = []
				for (const componentResult of studentResult.componentResults) {
					const created = await tx.examComponentResult.create({
						data: {
							examComponentId: componentResult.examComponentId,
							studentId: studentResult.studentId,
							obtainedMarks: componentResult.isAbsent
								? 0
								: componentResult.obtainedMarks,
							isAbsent: componentResult.isAbsent || false,
							remarks: componentResult.remarks,
							tenantId,
							examResultId: 'temp', // Will be updated after creating exam result
						},
						include: {
							examComponent: true,
						},
					})
					componentResults.push(created)
				}

				// Calculate totals
				const totalObtainedMarks = componentResults.reduce(
					(sum, cr) => (cr.isAbsent ? sum : sum + cr.obtainedMarks),
					0,
				)
				const totalMaxMarks = componentResults.reduce(
					(sum, cr) => sum + cr.examComponent.maxMarks,
					0,
				)
				const percentage =
					totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0
				const isAbsent = componentResults.some(cr => cr.isAbsent)

				// Get grading scale for calculating grade
				const gradingScale = await tx.gradingScale.findFirst({
					where: { tenantId },
					include: {
						items: {
							orderBy: { minPercentage: 'asc' },
						},
					},
				})

				let grade = 'N/A'
				if (gradingScale) {
					const gradeItem = gradingScale.items.find(
						item =>
							percentage >= item.minPercentage &&
							percentage <= item.maxPercentage,
					)
					grade = isAbsent ? 'ABS' : gradeItem?.grade || 'F'
				}

				// Create main exam result
				const examResult = await tx.examResult.create({
					data: {
						examScheduleId,
						studentId: studentResult.studentId,
						obtainedMarks: totalObtainedMarks,
						totalMarks: totalMaxMarks,
						percentage,
						grade,
						isAbsent,
						tenantId,
					},
				})

				// Update component results with correct examResultId
				await tx.examComponentResult.updateMany({
					where: {
						examComponent: {
							examScheduleId,
						},
						studentId: studentResult.studentId,
					},
					data: {
						examResultId: examResult.id,
					},
				})

				createdResults.push({
					examResult,
					componentResults: componentResults.map(cr => ({
						...cr,
						examResultId: examResult.id,
					})),
				})
			}

			return createdResults
		})
	},

	// Find results by exam schedule
	async findByExamScheduleId({
		examScheduleId,
		includeUnpublished = false,
		tenantId,
	}: {
		examScheduleId: string
		includeUnpublished?: boolean
		tenantId: string
	}) {
		const whereClause: Prisma.ExamResultWhereInput = {
			examScheduleId,
		}

		if (!includeUnpublished) {
			whereClause.examSchedule = {
				resultPublish: {
					some: {
						isPublished: true,
					},
				},
			}
		}

		return await prisma.examResult.findMany({
			where: whereClause,
			include: {
				student: {
					select: {
						id: true,
						name: true,
						roll: true,
						photo: true,
					},
				},
				componentResults: {
					include: {
						examComponent: true,
					},
					orderBy: {
						examComponent: {
							order: 'asc',
						},
					},
				},
				examSchedule: {
					include: {
						exam: {
							include: {
								examType: true,
							},
						},
						subject: true,
						class: true,
						section: true,
					},
				},
			},
			orderBy: {
				student: {
					roll: 'asc',
				},
			},
		})
	},

	// Find student results
	async findStudentResults({
		filters,
		tenantId,
	}: {
		filters: StudentResultFilters
		tenantId: string
	}) {
		const whereClause: Prisma.ExamResultWhereInput = {
			studentId: filters.studentId,
			examSchedule: {
				resultPublish: {
					some: {
						isPublished: true,
					},
				},
			},
		}

		return await prisma.examResult.findMany({
			where: whereClause,
			include: {
				componentResults: {
					include: {
						examComponent: true,
					},
					orderBy: {
						examComponent: {
							order: 'asc',
						},
					},
				},
				examSchedule: {
					include: {
						exam: {
							include: {
								examType: true,
								session: true,
							},
						},
						subject: true,
						class: true,
						section: true,
					},
				},
			},
			orderBy: {
				examSchedule: {
					exam: {
						startDate: 'desc',
					},
				},
			},
		})
	},

	// Update component result
	async updateComponentResult({
		id,
		obtainedMarks,
		remarks,
		updatedById,
		tenantId,
	}: {
		id: string
		obtainedMarks: number
		remarks?: string
		updatedById: string
		tenantId: string
	}) {
		return await prisma.$transaction(async tx => {
			const componentResult = await tx.examComponentResult.findUnique({
				where: { id },
				include: {
					examComponent: true,
					examResult: true,
				},
			})

			if (!componentResult) {
				throw new Error('Component result not found')
			}

			// Create audit log
			await tx.resultAuditLog.create({
				data: {
					examComponentResultId: id,
					oldMarks: componentResult.obtainedMarks,
					newMarks: obtainedMarks,
					updatedById,
					tenantId,
				},
			})

			// Update component result
			await tx.examComponentResult.update({
				where: { id },
				data: {
					obtainedMarks,
					remarks: remarks || componentResult.remarks,
				},
			})

			// Recalculate exam result
			const allComponentResults = await tx.examComponentResult.findMany({
				where: {
					examResultId: componentResult.examResultId,
				},
				include: {
					examComponent: true,
				},
			})

			const updatedComponentResults = allComponentResults.map(cr =>
				cr.id === id ? { ...cr, obtainedMarks } : cr,
			)

			const totalObtainedMarks = updatedComponentResults.reduce(
				(sum, cr) => (cr.isAbsent ? sum : sum + cr.obtainedMarks),
				0,
			)
			const totalMaxMarks = updatedComponentResults.reduce(
				(sum, cr) => sum + cr.examComponent.maxMarks,
				0,
			)
			const percentage =
				totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0
			const isAbsent = updatedComponentResults.some(cr => cr.isAbsent)

			// Get grade
			const gradingScale = await tx.gradingScale.findFirst({
				where: { tenantId },
				include: {
					items: {
						orderBy: { minPercentage: 'asc' },
					},
				},
			})

			let grade = 'N/A'
			if (gradingScale) {
				const gradeItem = gradingScale.items.find(
					item =>
						percentage >= item.minPercentage &&
						percentage <= item.maxPercentage,
				)
				grade = isAbsent ? 'ABS' : gradeItem?.grade || 'F'
			}

			await tx.examResult.update({
				where: { id: componentResult.examResultId },
				data: {
					obtainedMarks: totalObtainedMarks,
					percentage,
					grade,
				},
			})

			return { success: true }
		})
	},

	// Get result statistics
	async getResultStatistics({
		examScheduleId,
		tenantId,
	}: {
		examScheduleId: string
		tenantId: string
	}) {
		const results = await prisma.examResult.findMany({
			where: { examScheduleId },
			include: {
				student: {
					select: { id: true, name: true },
				},
				componentResults: {
					include: {
						examComponent: true,
					},
				},
			},
		})

		const totalStudents = results.length
		const absentStudents = results.filter(r => r.isAbsent).length
		const presentStudents = totalStudents - absentStudents

		const presentResults = results.filter(r => !r.isAbsent)
		const averagePercentage =
			presentResults.length > 0
				? presentResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
					presentResults.length
				: 0

		const highestMarks =
			presentResults.length > 0
				? Math.max(...presentResults.map(r => r.obtainedMarks))
				: 0

		const lowestMarks =
			presentResults.length > 0
				? Math.min(...presentResults.map(r => r.obtainedMarks))
				: 0

		// Grade distribution
		const gradeDistribution = presentResults.reduce(
			(acc, result) => {
				const grade = result.grade || 'N/A'
				acc[grade] = (acc[grade] || 0) + 1
				return acc
			},
			{} as Record<string, number>,
		)

		// Pass rate (assuming 40% is passing)
		const passRate =
			presentResults.length > 0
				? (presentResults.filter(r => (r.percentage || 0) >= 40).length /
						presentResults.length) *
					100
				: 0

		// Component statistics
		const componentStats = new Map()
		results.forEach(result => {
			if (!result.isAbsent) {
				result.componentResults.forEach(cr => {
					const componentId = cr.examComponent.id
					const componentName = cr.examComponent.name
					if (!componentStats.has(componentId)) {
						componentStats.set(componentId, {
							componentId,
							componentName,
							totalMarks: 0,
							maxMarks: cr.examComponent.maxMarks,
							count: 0,
							highest: 0,
							lowest: cr.examComponent.maxMarks,
						})
					}

					const stat = componentStats.get(componentId)
					stat.totalMarks += cr.obtainedMarks
					stat.count += 1
					stat.highest = Math.max(stat.highest, cr.obtainedMarks)
					stat.lowest = Math.min(stat.lowest, cr.obtainedMarks)
				})
			}
		})

		const componentStatsArray = Array.from(componentStats.values()).map(
			stat => ({
				...stat,
				averageMarks: stat.totalMarks / stat.count,
				averagePercentage:
					(stat.totalMarks / (stat.maxMarks * stat.count)) * 100,
			}),
		)

		return {
			totalStudents,
			presentStudents,
			absentStudents,
			averagePercentage: Math.round(averagePercentage * 100) / 100,
			highestMarks,
			lowestMarks,
			gradeDistribution,
			passRate: Math.round(passRate * 100) / 100,
			componentStats: componentStatsArray,
		}
	},
}
