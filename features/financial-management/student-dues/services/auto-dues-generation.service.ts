import { prisma } from '@/lib/db'
import { createStudentDuesService } from './studentDue.service'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CACHE_KEYS } from '@/constants/cache'

interface AutoDuesGenerationResult {
	studentsProcessed: number
	studentsUpdated: number
	totalDuesCreated: number
	errors: Array<{
		studentId: string
		error: string
	}>
}

/**
 * Automatically generate missing dues for a single student
 * from their last due month to current month
 */
export async function generateMissingDuesForStudent(
	studentId: string,
	tenantId: string
): Promise<{
	success: boolean
	message: string
	duesCreated: number
}> {
	try {
		// Get student with admission date and fee structure
		const student = await prisma.student.findUnique({
			where: {
				id: studentId,
				tenantId,
				status: 'ACTIVE',
			},
			select: {
				id: true,
				name: true,
				admissionDate: true,
				feeStructureId: true,
				tenantId: true,
			},
		})

		if (!student) {
			return {
				success: false,
				message: 'Student not found or inactive',
				duesCreated: 0,
			}
		}

		if (!student.feeStructureId) {
			return {
				success: false,
				message: 'Student has no fee structure assigned',
				duesCreated: 0,
			}
		}

		if (!student.admissionDate) {
			return {
				success: false,
				message: 'Student has no admission date',
				duesCreated: 0,
			}
		}

		// Use the existing service to create missing dues
		const result = await createStudentDuesService({
			studentId: student.id,
			tenantId: student.tenantId,
			admissionDate: student.admissionDate,
			currentDate: new Date(),
			feeStructureId: student.feeStructureId,
		})

		return {
			success: true,
			message: result.message,
			duesCreated: result.createdDuesCount,
		}
	} catch (error) {
		console.error('Error generating missing dues for student:', studentId, error)
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error occurred',
			duesCreated: 0,
		}
	}
}

/**
 * Automatically generate missing dues for students in a specific class/section
 */
export async function generateMissingDuesForClassSection(
	classId?: string,
	sectionId?: string,
	tenantId?: string
): Promise<AutoDuesGenerationResult> {
	const result: AutoDuesGenerationResult = {
		studentsProcessed: 0,
		studentsUpdated: 0,
		totalDuesCreated: 0,
		errors: [],
	}

	try {
		// Build where condition
		const whereCondition: any = {
			status: 'ACTIVE',
		}

		if (tenantId) {
			whereCondition.tenantId = tenantId
		}

		if (classId) {
			whereCondition.classId = classId
		}

		if (sectionId) {
			whereCondition.sectionId = sectionId
		}

		// Get active students
		const students = await prisma.student.findMany({
			where: whereCondition,
			select: {
				id: true,
				name: true,
				admissionDate: true,
				feeStructureId: true,
				tenantId: true,
			},
		})

		result.studentsProcessed = students.length

		// Process each student
		for (const student of students) {
			try {
				if (!student.feeStructureId || !student.admissionDate) {
					result.errors.push({
						studentId: student.id,
						error: 'Missing fee structure or admission date',
					})
					continue
				}

				const studentResult = await createStudentDuesService({
					studentId: student.id,
					tenantId: student.tenantId,
					admissionDate: student.admissionDate,
					currentDate: new Date(),
					feeStructureId: student.feeStructureId,
				})

				if (studentResult.createdDuesCount > 0) {
					result.studentsUpdated++
					result.totalDuesCreated += studentResult.createdDuesCount
				}
			} catch (error) {
				result.errors.push({
					studentId: student.id,
					error: error instanceof Error ? error.message : 'Unknown error',
				})
			}
		}

		return result
	} catch (error) {
		console.error('Error in generateMissingDuesForClassSection:', error)
		throw error
	}
}

/**
 * Generate missing dues for all active students in a tenant
 */
export async function generateMissingDuesForAllStudents(
	tenantId: string
): Promise<AutoDuesGenerationResult> {
	return generateMissingDuesForClassSection(undefined, undefined, tenantId)
}

/**
 * Check if a student needs dues generation and generate them
 * This is the main function to be called from pages/components
 */
export async function ensureStudentDuesUpToDate(
	studentId: string,
	tenantId: string
): Promise<{
	needsUpdate: boolean
	result?: {
		success: boolean
		message: string
		duesCreated: number
	}
}> {
	try {
		// Check if student has missing dues by looking at their last due and current date
		const student = await prisma.student.findUnique({
			where: {
				id: studentId,
				tenantId,
				status: 'ACTIVE',
			},
			select: {
				id: true,
				admissionDate: true,
				feeStructureId: true,
				studentDues: {
					select: {
						month: true,
						year: true,
					},
					orderBy: [
						{ year: 'desc' },
						{ month: 'desc' },
					],
					take: 1,
				},
			},
		})

		if (!student || !student.admissionDate || !student.feeStructureId) {
			return {
				needsUpdate: false,
			}
		}

		const currentDate = new Date()
		const currentMonth = currentDate.getMonth() + 1
		const currentYear = currentDate.getFullYear()

		// If no dues exist at all, definitely needs update
		if (student.studentDues.length === 0) {
			const result = await generateMissingDuesForStudent(studentId, tenantId)
			return {
				needsUpdate: true,
				result,
			}
		}

		// Check if the last due is current
		const lastDue = student.studentDues[0]
		const lastDueDate = new Date(lastDue.year, lastDue.month - 1) // month is 0-indexed in Date
		const currentDueDate = new Date(currentYear, currentMonth - 1)

		// If last due is before current month, generate missing dues
		if (lastDueDate < currentDueDate) {
			const result = await generateMissingDuesForStudent(studentId, tenantId)
			return {
				needsUpdate: true,
				result,
			}
		}

		return {
			needsUpdate: false,
		}
	} catch (error) {
		console.error('Error checking student dues status:', error)
		return {
			needsUpdate: false,
		}
	}
}

/**
 * Ensure dues are up to date for multiple students
 */
export async function ensureMultipleStudentsDuesUpToDate(
	studentIds: string[],
	tenantId: string
): Promise<{
	studentsProcessed: number
	studentsUpdated: number
	totalDuesCreated: number
	errors: Array<{
		studentId: string
		error: string
	}>
}> {
	const result = {
		studentsProcessed: studentIds.length,
		studentsUpdated: 0,
		totalDuesCreated: 0,
		errors: [] as Array<{ studentId: string; error: string }>,
	}

	for (const studentId of studentIds) {
		try {
			const updateResult = await ensureStudentDuesUpToDate(studentId, tenantId)
			
			if (updateResult.needsUpdate && updateResult.result?.success) {
				result.studentsUpdated++
				result.totalDuesCreated += updateResult.result.duesCreated
			} else if (updateResult.needsUpdate && updateResult.result && !updateResult.result.success) {
				result.errors.push({
					studentId,
					error: updateResult.result.message,
				})
			}
		} catch (error) {
			result.errors.push({
				studentId,
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}

	return result
}