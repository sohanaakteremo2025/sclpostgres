import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class ResultPublicationRepository {
	constructor(private tenantId: string) {}

	async findMany(filters?: {
		examId?: string
		classId?: string
		sectionId?: string
		sessionId?: string
		isPublished?: boolean
	}) {
		const whereClause: Prisma.ResultPublishWhereInput = {
			tenantId: this.tenantId,
		}

		if (filters?.isPublished !== undefined) {
			whereClause.isPublished = filters.isPublished
		}

		if (filters?.examId || filters?.classId || filters?.sectionId || filters?.sessionId) {
			whereClause.examSchedule = {}
			
			if (filters?.classId) {
				whereClause.examSchedule.classId = filters.classId
			}
			
			if (filters?.sectionId) {
				whereClause.examSchedule.sectionId = filters.sectionId
			}

			if (filters?.examId || filters?.sessionId) {
				whereClause.examSchedule.exam = {}
				
				if (filters?.examId) {
					whereClause.examSchedule.exam.id = filters.examId
				}
				
				if (filters?.sessionId) {
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
						results: {
							select: {
								id: true,
								obtainedMarks: true,
								totalMarks: true,
								percentage: true,
								grade: true,
								isAbsent: true,
								student: {
									select: {
										id: true,
										name: true,
										roll: true,
									},
								},
							},
						},
						components: {
							select: {
								id: true,
								name: true,
								maxMarks: true,
								order: true,
							},
							orderBy: {
								order: 'asc',
							},
						},
					},
				},
			},
			orderBy: [
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
	}

	async findByExamSchedule(examScheduleId: string) {
		return await prisma.resultPublish.findFirst({
			where: {
				examScheduleId,
				tenantId: this.tenantId,
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
						components: {
							orderBy: {
								order: 'asc',
							},
						},
					},
				},
			},
		})
	}

	async getPublishedExamSchedules(filters?: {
		classId?: string
		sectionId?: string
		sessionId?: string
		subjectId?: string
	}) {
		const whereClause: Prisma.ExamScheduleWhereInput = {
			tenantId: this.tenantId,
			resultPublish: {
				some: {
					isPublished: true,
				},
			},
		}

		if (filters?.classId) {
			whereClause.classId = filters.classId
		}

		if (filters?.sectionId) {
			whereClause.sectionId = filters.sectionId
		}

		if (filters?.subjectId) {
			whereClause.subjectId = filters.subjectId
		}

		if (filters?.sessionId) {
			whereClause.exam = {
				sessionId: filters.sessionId,
			}
		}

		return await prisma.examSchedule.findMany({
			where: whereClause,
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
				resultPublish: {
					where: {
						isPublished: true,
					},
				},
				_count: {
					select: {
						results: true,
					},
				},
			},
			orderBy: [
				{
					exam: {
						startDate: 'desc',
					},
				},
				{
					date: 'desc',
				},
			],
		})
	}

	async getClassResults(classId: string, sectionId: string, sessionId: string) {
		return await prisma.examResult.findMany({
			where: {
				examSchedule: {
					classId,
					sectionId,
					exam: {
						sessionId,
					},
					resultPublish: {
						some: {
							isPublished: true,
						},
					},
				},
			},
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
					},
				},
			},
			orderBy: [
				{
					examSchedule: {
						exam: {
							startDate: 'asc',
						},
					},
				},
				{
					student: {
						roll: 'asc',
					},
				},
			],
		})
	}

	async getStudentResults(studentId: string, sessionId?: string) {
		const whereClause: Prisma.ExamResultWhereInput = {
			studentId,
			examSchedule: {
				resultPublish: {
					some: {
						isPublished: true,
					},
				},
			},
		}

		if (sessionId) {
			whereClause.examSchedule = {
				...whereClause.examSchedule,
				exam: {
					sessionId,
				},
			}
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
	}

	async getResultStatisticsBySession(sessionId: string) {
		const results = await prisma.examResult.findMany({
			where: {
				examSchedule: {
					exam: {
						sessionId,
					},
					resultPublish: {
						some: {
							isPublished: true,
						},
					},
				},
			},
			include: {
				student: {
					select: {
						id: true,
						name: true,
						classId: true,
						sectionId: true,
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
		})

		// Group by class and section
		const groupedResults = results.reduce(
			(acc, result) => {
				const key = `${result.student.classId}-${result.student.sectionId}`
				if (!acc[key]) {
					acc[key] = {
						classId: result.student.classId,
						sectionId: result.student.sectionId,
						className: result.examSchedule.class.name,
						sectionName: result.examSchedule.section?.name || '',
						results: [],
					}
				}
				acc[key].results.push(result)
				return acc
			},
			{} as Record<string, any>,
		)

		// Calculate statistics for each group
		return Object.values(groupedResults).map((group: any) => {
			const totalStudents = new Set(group.results.map((r: any) => r.student.id)).size
			const absentCount = group.results.filter((r: any) => r.isAbsent).length
			const presentResults = group.results.filter((r: any) => !r.isAbsent)
			
			const averagePercentage =
				presentResults.length > 0
					? presentResults.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) /
						presentResults.length
					: 0

			const subjectStats = presentResults.reduce((acc: any, result: any) => {
				const subjectId = result.examSchedule.subject.id
				const subjectName = result.examSchedule.subject.name
				
				if (!acc[subjectId]) {
					acc[subjectId] = {
						subjectName,
						totalMarks: 0,
						obtainedMarks: 0,
						count: 0,
					}
				}
				
				acc[subjectId].totalMarks += result.totalMarks
				acc[subjectId].obtainedMarks += result.obtainedMarks
				acc[subjectId].count += 1
				
				return acc
			}, {})

			return {
				...group,
				statistics: {
					totalStudents,
					absentCount,
					presentCount: totalStudents - absentCount,
					averagePercentage: Math.round(averagePercentage * 100) / 100,
					subjectWiseStats: Object.values(subjectStats).map((stat: any) => ({
						...stat,
						averagePercentage: (stat.obtainedMarks / stat.totalMarks) * 100,
					})),
				},
			}
		})
	}

	async getUnpublishedResults(filters?: {
		classId?: string
		sectionId?: string
		sessionId?: string
	}) {
		const whereClause: Prisma.ExamScheduleWhereInput = {
			tenantId: this.tenantId,
			results: {
				some: {},
			},
			OR: [
				{
					resultPublish: {
						none: {},
					},
				},
				{
					resultPublish: {
						some: {
							isPublished: false,
						},
					},
				},
			],
		}

		if (filters?.classId) {
			whereClause.classId = filters.classId
		}

		if (filters?.sectionId) {
			whereClause.sectionId = filters.sectionId
		}

		if (filters?.sessionId) {
			whereClause.exam = {
				sessionId: filters.sessionId,
			}
		}

		return await prisma.examSchedule.findMany({
			where: whereClause,
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
				resultPublish: true,
				_count: {
					select: {
						results: true,
					},
				},
			},
			orderBy: [
				{
					exam: {
						startDate: 'desc',
					},
				},
				{
					date: 'desc',
				},
			],
		})
	}
}