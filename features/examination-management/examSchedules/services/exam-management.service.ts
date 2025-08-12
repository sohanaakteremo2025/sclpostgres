import { prisma } from '@/lib/db'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CACHE_KEYS } from '@/constants/cache'

export interface ExamWithSchedules {
	id: string
	title: string
	startDate: Date
	endDate: Date
	status: string
	examType: {
		name: string
	}
	session: {
		title: string
	}
	schedulesByClass: {
		classId: string
		className: string
		sections: {
			sectionId: string | null
			sectionName: string | null
			schedules: ExamScheduleDetails[]
		}[]
	}[]
	totalSchedules: number
	completedSchedules: number
	canMarkComplete: boolean
}

export interface ExamScheduleDetails {
	id: string
	date: Date
	startTime: number
	endTime: number
	room?: string
	subject: {
		name: string
	}
	components: {
		name: string
		maxMarks: number
	}[]
	invigilators: {
		id: string
		name: string
	}[]
	hasResults: boolean
	resultCount: number
	studentCount: number
}

/**
 * Get all exams with their schedules organized by exam and class
 */
export async function getOrganizedExamSchedules(tenantId: string): Promise<ExamWithSchedules[]> {
	try {
		// Get all exams with their schedules
		const exams = await prisma.exam.findMany({
			where: { tenantId },
			include: {
				examType: {
					select: {
						name: true
					}
				},
				session: {
					select: {
						title: true
					}
				},
				schedules: {
					include: {
						class: {
							select: {
								id: true,
								name: true
							}
						},
						section: {
							select: {
								id: true,
								name: true
							}
						},
						subject: {
							select: {
								name: true
							}
						},
						components: {
							select: {
								name: true,
								maxMarks: true,
								order: true
							}
						},
						invigilators: {
							select: {
								id: true,
								name: true
							}
						},
						results: {
							select: {
								id: true
							}
						}
					}
				}
			},
			orderBy: [
				{ startDate: 'desc' }
			]
		})

		// Transform and organize the data
		const organizedExams: ExamWithSchedules[] = []

		for (const exam of exams) {
			// Group schedules by class
			const schedulesByClass = new Map<string, {
				classId: string
				className: string
				sections: Map<string | null, {
					sectionId: string | null
					sectionName: string | null
					schedules: ExamScheduleDetails[]
				}>
			}>()

			for (const schedule of exam.schedules) {
				const classId = schedule.class.id
				const className = schedule.class.name
				const sectionId = schedule.section?.id || null
				const sectionName = schedule.section?.name || null

				// Get class group
				if (!schedulesByClass.has(classId)) {
					schedulesByClass.set(classId, {
						classId,
						className,
						sections: new Map()
					})
				}

				const classGroup = schedulesByClass.get(classId)!

				// Get section group within class
				const sectionKey = sectionId || 'null'
				if (!classGroup.sections.has(sectionKey)) {
					classGroup.sections.set(sectionKey, {
						sectionId,
						sectionName,
						schedules: []
					})
				}

				// Get student count for this class/section
				const studentCount = await getStudentCountForClassSection(classId, sectionId, tenantId)

				// Transform schedule
				const scheduleDetails: ExamScheduleDetails = {
					id: schedule.id,
					date: schedule.date,
					startTime: schedule.startTime,
					endTime: schedule.endTime,
					room: schedule.room || undefined,
					subject: schedule.subject,
					components: schedule.components.sort((a, b) => a.order - b.order),
					invigilators: schedule.invigilators,
					hasResults: schedule.results.length > 0,
					resultCount: schedule.results.length,
					studentCount
				}

				classGroup.sections.get(sectionKey)!.schedules.push(scheduleDetails)
			}

			// Convert maps to arrays and calculate completion stats
			const schedulesByClassArray = Array.from(schedulesByClass.values()).map(classGroup => ({
				...classGroup,
				sections: Array.from(classGroup.sections.values()).map(sectionGroup => ({
					...sectionGroup,
					schedules: sectionGroup.schedules.sort((a, b) => 
						new Date(a.date).getTime() - new Date(b.date).getTime()
					)
				}))
			}))

			const totalSchedules = exam.schedules.length
			const completedSchedules = exam.schedules.filter(s => s.results.length > 0).length
			
			// Can mark complete if all schedules have results or exam end date has passed
			const canMarkComplete = 
				exam.status === 'ONGOING' && (
					completedSchedules === totalSchedules || 
					new Date() > exam.endDate
				)

			organizedExams.push({
				id: exam.id,
				title: exam.title,
				startDate: exam.startDate,
				endDate: exam.endDate,
				status: exam.status,
				examType: exam.examType,
				session: exam.session,
				schedulesByClass: schedulesByClassArray,
				totalSchedules,
				completedSchedules,
				canMarkComplete
			})
		}

		return organizedExams

	} catch (error) {
		console.error('Error getting organized exam schedules:', error)
		throw error
	}
}

/**
 * Get student count for a class/section
 */
async function getStudentCountForClassSection(classId: string, sectionId: string | null, tenantId: string): Promise<number> {
	const whereCondition: any = {
		classId,
		tenantId,
		status: 'ACTIVE'
	}

	if (sectionId) {
		whereCondition.sectionId = sectionId
	}

	return await prisma.student.count({
		where: whereCondition
	})
}

/**
 * Update exam status
 */
export async function updateExamStatus(examId: string, status: string, tenantId: string) {
	try {
		const validStatuses = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']
		if (!validStatuses.includes(status)) {
			throw new Error('Invalid exam status')
		}

		const updatedExam = await prisma.exam.update({
			where: {
				id: examId,
				tenantId
			},
			data: {
				status: status as any
			}
		})

		// Invalidate cache
		await nextjsCacheService.invalidate([
			CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId),
			CACHE_KEYS.EXAMS.TAG(tenantId)
		])

		return updatedExam

	} catch (error) {
		console.error('Error updating exam status:', error)
		throw error
	}
}

/**
 * Mark exam as completed
 */
export async function markExamComplete(examId: string, tenantId: string) {
	try {
		// Check if exam exists and can be completed
		const exam = await prisma.exam.findUnique({
			where: {
				id: examId,
				tenantId
			},
			include: {
				schedules: {
					include: {
						results: true
					}
				}
			}
		})

		if (!exam) {
			throw new Error('Exam not found')
		}

		if (exam.status === 'COMPLETED') {
			throw new Error('Exam is already completed')
		}

		// Check if all schedules have results or exam period has ended
		const totalSchedules = exam.schedules.length
		const completedSchedules = exam.schedules.filter(s => s.results.length > 0).length
		const examEnded = new Date() > exam.endDate

		if (completedSchedules < totalSchedules && !examEnded) {
			throw new Error('Cannot complete exam: Not all schedules have results and exam period has not ended')
		}

		// Update exam status to completed
		const updatedExam = await updateExamStatus(examId, 'COMPLETED', tenantId)

		return {
			success: true,
			message: 'Exam marked as completed successfully',
			exam: updatedExam
		}

	} catch (error) {
		console.error('Error marking exam as complete:', error)
		throw error
	}
}

/**
 * Start an exam (change status to ONGOING)
 */
export async function startExam(examId: string, tenantId: string) {
	try {
		const exam = await prisma.exam.findUnique({
			where: {
				id: examId,
				tenantId
			}
		})

		if (!exam) {
			throw new Error('Exam not found')
		}

		if (exam.status !== 'SCHEDULED') {
			throw new Error('Only scheduled exams can be started')
		}

		const updatedExam = await updateExamStatus(examId, 'ONGOING', tenantId)

		return {
			success: true,
			message: 'Exam started successfully',
			exam: updatedExam
		}

	} catch (error) {
		console.error('Error starting exam:', error)
		throw error
	}
}

/**
 * Cancel an exam
 */
export async function cancelExam(examId: string, tenantId: string) {
	try {
		const exam = await prisma.exam.findUnique({
			where: {
				id: examId,
				tenantId
			}
		})

		if (!exam) {
			throw new Error('Exam not found')
		}

		if (exam.status === 'COMPLETED') {
			throw new Error('Cannot cancel completed exam')
		}

		const updatedExam = await updateExamStatus(examId, 'CANCELLED', tenantId)

		return {
			success: true,
			message: 'Exam cancelled successfully',
			exam: updatedExam
		}

	} catch (error) {
		console.error('Error cancelling exam:', error)
		throw error
	}
}

/**
 * Get exam completion statistics for a tenant
 */
export async function getExamCompletionStats(tenantId: string) {
	try {
		const stats = await prisma.exam.groupBy({
			by: ['status'],
			where: { tenantId },
			_count: {
				id: true
			}
		})

		const result = {
			total: 0,
			scheduled: 0,
			ongoing: 0,
			completed: 0,
			cancelled: 0
		}

		stats.forEach(stat => {
			result.total += stat._count.id
			switch (stat.status) {
				case 'SCHEDULED':
					result.scheduled = stat._count.id
					break
				case 'ONGOING':
					result.ongoing = stat._count.id
					break
				case 'COMPLETED':
					result.completed = stat._count.id
					break
				case 'CANCELLED':
					result.cancelled = stat._count.id
					break
			}
		})

		return result

	} catch (error) {
		console.error('Error getting exam completion stats:', error)
		throw error
	}
}