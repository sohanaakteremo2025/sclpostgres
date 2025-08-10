'use server'

import { getTenantId } from '@/lib/tenant'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export interface StudentMarksheetData {
	id: string
	name: string
	roll: string
	photo?: string
	fatherName?: string
	motherName?: string
	class: {
		id: string
		name: string
	}
	section?: {
		id: string
		name: string
	}
	results: {
		id: string
		examSchedule: {
			id: string
			exam: {
				title: string
				examType: {
					name: string
				}
				session: {
					title: string
				}
			}
			subject: {
				name: string
				code: string
			}
			date: string
		}
		obtainedMarks: number
		totalMarks: number
		percentage: number
		grade: string
		isAbsent: boolean
		componentResults: {
			examComponent: {
				name: string
				maxMarks: number
			}
			obtainedMarks: number
			isAbsent: boolean
		}[]
	}[]
}

export async function getStudentsForMarksheet(filters: {
	classId?: string
	sectionId?: string
	sessionId?: string
	search?: string
}) {
	try {
		const tenantId = await getTenantId()
		const session = await auth()

		if (!session?.user) {
			return { success: false, error: 'Unauthorized' }
		}

		// Build where clause for students
		const whereClause: any = {
			tenantId,
			status: 'ACTIVE',
		}

		if (filters.classId) {
			whereClause.enrollments = {
				some: {
					classId: filters.classId,
					...(filters.sectionId && { sectionId: filters.sectionId }),
					...(filters.sessionId && { sessionId: filters.sessionId }),
				},
			}
		}

		if (filters.search) {
			whereClause.OR = [
				{ name: { contains: filters.search, mode: 'insensitive' } },
				{ roll: { contains: filters.search, mode: 'insensitive' } },
				{ studentId: { contains: filters.search, mode: 'insensitive' } },
			]
		}

		// Get students with their current enrollment
		const students = await prisma.student.findMany({
			where: whereClause,
			select: {
				id: true,
				name: true,
				roll: true,
				photo: true,
				studentId: true,
				fatherName: true,
				motherName: true,
				enrollments: {
					where: {
						...(filters.classId && { classId: filters.classId }),
						...(filters.sectionId && { sectionId: filters.sectionId }),
						...(filters.sessionId && { sessionId: filters.sessionId }),
					},
					select: {
						id: true,
						class: {
							select: {
								id: true,
								name: true,
							},
						},
						section: {
							select: {
								id: true,
								name: true,
							},
						},
						session: {
							select: {
								id: true,
								title: true,
							},
						},
					},
					take: 1,
					orderBy: { createdAt: 'desc' },
				},
			},
			orderBy: [
				{ roll: 'asc' },
				{ name: 'asc' },
			],
		})

		// Transform to include class/section from enrollment
		const transformedStudents = students.map(student => {
			const enrollment = student.enrollments[0]
			return {
				id: student.id,
				name: student.name,
				roll: student.roll,
				photo: student.photo,
				studentId: student.studentId,
				fatherName: student.fatherName,
				motherName: student.motherName,
				class: enrollment?.class || null,
				section: enrollment?.section || null,
				session: enrollment?.session || null,
			}
		}).filter(student => student.class) // Only include students with valid enrollments

		return {
			success: true,
			data: transformedStudents,
		}
	} catch (error: any) {
		console.error('Error fetching students for marksheet:', error)
		return {
			success: false,
			error: error.message || 'Failed to fetch students',
		}
	}
}

export async function getStudentMarksheetData(studentId: string, sessionId?: string) {
	try {
		const tenantId = await getTenantId()
		const session = await auth()

		if (!session?.user) {
			return { success: false, error: 'Unauthorized' }
		}

		// Get student basic info with current enrollment
		const student = await prisma.student.findFirst({
			where: {
				id: studentId,
				tenantId,
			},
			select: {
				id: true,
				name: true,
				roll: true,
				photo: true,
				studentId: true,
				fatherName: true,
				motherName: true,
				enrollments: {
					where: {
						...(sessionId && { sessionId }),
					},
					select: {
						class: {
							select: {
								id: true,
								name: true,
							},
						},
						section: {
							select: {
								id: true,
								name: true,
							},
						},
						session: {
							select: {
								id: true,
								title: true,
							},
						},
					},
					take: 1,
					orderBy: { createdAt: 'desc' },
				},
			},
		})

		if (!student) {
			return { success: false, error: 'Student not found' }
		}

		// Get all published results for this student
		const results = await prisma.examResult.findMany({
			where: {
				studentId,
				tenantId,
				examSchedule: {
					resultPublish: {
						some: {
							isPublished: true,
						},
					},
					...(sessionId && {
						exam: {
							sessionId,
						},
					}),
				},
			},
			include: {
				componentResults: {
					include: {
						examComponent: {
							select: {
								name: true,
								maxMarks: true,
								order: true,
							},
						},
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
								examType: {
									select: {
										name: true,
									},
								},
								session: {
									select: {
										id: true,
										title: true,
									},
								},
							},
						},
						subject: {
							select: {
								name: true,
								code: true,
							},
						},
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
					examSchedule: {
						subject: {
							name: 'asc',
						},
					},
				},
			],
		})

		// Transform results data
		const transformedResults = results.map(result => ({
			id: result.id,
			examSchedule: {
				id: result.examSchedule.id,
				exam: {
					title: result.examSchedule.exam.title,
					examType: {
						name: result.examSchedule.exam.examType.name,
					},
					session: {
						title: result.examSchedule.exam.session.title,
					},
				},
				subject: {
					name: result.examSchedule.subject.name,
					code: result.examSchedule.subject.code,
				},
				date: result.examSchedule.date.toISOString().split('T')[0],
			},
			obtainedMarks: result.obtainedMarks,
			totalMarks: result.totalMarks,
			percentage: result.percentage || 0,
			grade: result.grade || '',
			isAbsent: result.isAbsent,
			componentResults: result.componentResults.map(cr => ({
				examComponent: {
					name: cr.examComponent.name,
					maxMarks: cr.examComponent.maxMarks,
				},
				obtainedMarks: cr.obtainedMarks,
				isAbsent: cr.isAbsent,
			})),
		}))

		const marksheetData: StudentMarksheetData = {
			id: student.id,
			name: student.name,
			roll: student.roll,
			photo: student.photo,
			fatherName: student.fatherName,
			motherName: student.motherName,
			class: student.enrollments[0]?.class || { id: '', name: 'Unknown' },
			section: student.enrollments[0]?.section,
			results: transformedResults,
		}

		return {
			success: true,
			data: marksheetData,
		}
	} catch (error: any) {
		console.error('Error fetching student marksheet data:', error)
		return {
			success: false,
			error: error.message || 'Failed to fetch marksheet data',
		}
	}
}

export async function getMarksheetSummary(studentId: string, sessionId?: string) {
	try {
		const tenantId = await getTenantId()
		const session = await auth()

		if (!session?.user) {
			return { success: false, error: 'Unauthorized' }
		}

		// Get results summary for the student
		const results = await prisma.examResult.findMany({
			where: {
				studentId,
				tenantId,
				isAbsent: false,
				examSchedule: {
					resultPublish: {
						some: {
							isPublished: true,
						},
					},
					...(sessionId && {
						exam: {
							sessionId,
						},
					}),
				},
			},
			select: {
				percentage: true,
				grade: true,
				obtainedMarks: true,
				totalMarks: true,
				examSchedule: {
					select: {
						exam: {
							select: {
								examType: {
									select: {
										name: true,
									},
								},
							},
						},
						subject: {
							select: {
								title: true,
							},
						},
					},
				},
			},
		})

		if (results.length === 0) {
			return {
				success: true,
				data: {
					totalExams: 0,
					averagePercentage: 0,
					totalMarks: 0,
					obtainedMarks: 0,
					gradeDistribution: {},
					subjectPerformance: {},
				},
			}
		}

		// Calculate summary statistics
		const totalExams = results.length
		const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0)
		const obtainedMarks = results.reduce((sum, r) => sum + r.obtainedMarks, 0)
		const averagePercentage = results.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalExams

		// Grade distribution
		const gradeDistribution = results.reduce<Record<string, number>>((acc, result) => {
			if (result.grade) {
				acc[result.grade] = (acc[result.grade] || 0) + 1
			}
			return acc
		}, {})

		// Subject performance
		const subjectPerformance = results.reduce<Record<string, { total: number, obtained: number, percentage: number, count: number }>>((acc, result) => {
			const subjectName = result.examSchedule.subject.name
			if (!acc[subjectName]) {
				acc[subjectName] = { total: 0, obtained: 0, percentage: 0, count: 0 }
			}
			acc[subjectName].total += result.totalMarks
			acc[subjectName].obtained += result.obtainedMarks
			acc[subjectName].percentage += result.percentage || 0
			acc[subjectName].count += 1
			return acc
		}, {})

		// Calculate average percentage per subject
		Object.keys(subjectPerformance).forEach(subject => {
			subjectPerformance[subject].percentage = subjectPerformance[subject].percentage / subjectPerformance[subject].count
		})

		return {
			success: true,
			data: {
				totalExams,
				averagePercentage: Math.round(averagePercentage * 100) / 100,
				totalMarks,
				obtainedMarks,
				gradeDistribution,
				subjectPerformance,
			},
		}
	} catch (error: any) {
		console.error('Error fetching marksheet summary:', error)
		return {
			success: false,
			error: error.message || 'Failed to fetch summary',
		}
	}
}