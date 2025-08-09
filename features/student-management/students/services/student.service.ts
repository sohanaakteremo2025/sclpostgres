import {
	CreateStudentPayload,
	FeeItem,
	Gender,
	Religion,
	StudentDue,
	UpdateDueItemInput,
	UpdateStudentInput,
} from '@/lib/zod'
import { studentDB } from '../db/student.repository'
import { prisma } from '@/lib/db'
import { userDB } from '@/features/user-management/users/db/user.repository'
import {
	getAllFeeItems,
	getAllFeeItemsByFeeStructureId,
} from '@/features/financial-management/feeItem/api/fee.action'
import { getAllFeeItemsByFeeStructureIdService } from '@/features/financial-management/feeItem/services/fee.service'
import { studentDueDB } from '@/features/financial-management/student-dues/db/studentDue.repository'
import { dueItemDB } from '@/features/financial-management/dueItem/db/duitem.repository'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { CACHE_KEYS } from '@/constants/cache'
import Decimal from 'decimal.js'
import { getMonthsBetween, getMonthsFromDateToCurrent } from '@/utils/get-months-between-dates'
import { generateLateFeeAdjustment } from '@/utils/late-fee-utils'
import { TransactionClient } from '@/types'
import { dueAdjustmentDB } from '@/features/financial-management/dueAdjustment/db/dueAdjustment.repository'
import { studentEnrollmentDB } from '../../enrollments/db/enrollment.repository'
import { createStudentDuesService } from '@/features/financial-management/student-dues/services/studentDue.service'

// Create due items with adjustments
const createDueItemsWithAdjustments = async (
	due: StudentDue,
	feeItems: FeeItem[],
	tenantId: string,
	tx: TransactionClient,
) => {
	const dueItemsToCreate = []
	const adjustmentsToCreate = []

	for (const feeItem of feeItems) {
		// Create the due item
		const dueItemData = {
			title: feeItem.name,
			originalAmount: feeItem.amount,
			finalAmount: feeItem.amount, // Will be updated after adjustments
			paidAmount: new Decimal(0),
			description: feeItem.description,
			categoryId: feeItem.categoryId,
			status: 'PENDING' as const,
			dueId: due.id,
			tenantId,
		}

		dueItemsToCreate.push(dueItemData)
	}

	// Create due items first
	const createdDueItems = await dueItemDB.createManyDueItem(
		dueItemsToCreate,
		tx,
	)

	// Now create adjustments for late fees
	for (let i = 0; i < createdDueItems.length; i++) {
		const dueItem = createdDueItems[i]
		const feeItem = feeItems[i]

		// Generate late fee adjustment if applicable
		const lateFeeAdjustment = generateLateFeeAdjustment(
			feeItem,
			due.month,
			due.year,
		)

		if (lateFeeAdjustment) {
			adjustmentsToCreate.push({
				...lateFeeAdjustment,
				amount: new Decimal(lateFeeAdjustment.amount),
				dueItemId: dueItem.id,
				tenantId,
			})

			// Update final amount
			await dueItemDB.update(
				dueItem.id,
				{
					finalAmount: new Decimal(
						Number(dueItem.originalAmount) + lateFeeAdjustment.amount,
					),
				} as UpdateDueItemInput,
				tx,
			)
		}
	}

	// Create adjustments if any
	if (adjustmentsToCreate.length > 0) {
		await dueAdjustmentDB.createManyDueAdjustment(adjustmentsToCreate, tx)
	}

	return createdDueItems
}

// export const createStudentService = async (data: CreateStudentPayload) => {
// 	return await prisma.$transaction(
// 		async tx => {
// 			// Create student
// 			const newStudent = await studentDB.create(data, tx)

// 			// Create user account
// 			await userDB.createUser(
// 				{
// 					name: data.name,
// 					email: data.email,
// 					status: 'ACTIVE',
// 					password: data.studentId,
// 					role: 'STUDENT',
// 					tenantId: data.tenantId,
// 				},
// 				tx,
// 			)

// 			// Create student enrollment record
// 			const enrollmentData = {
// 				roll: data.roll || data.studentId,
// 				status: 'ENROLLED' as const,
// 				joinDate: new Date(data.admissionDate || new Date()),
// 				tenantId: data.tenantId,
// 				studentId: newStudent.id,
// 				classId: data.classId,
// 				sectionId: data.sectionId,
// 				sessionId: data.sessionId,
// 				note: 'New admission',
// 			}

// 			await studentEnrollmentDB.create(enrollmentData, tx)

// 			// Use the standalone service to create dues
// 			const duesResult = await createStudentDuesService({
// 				studentId: newStudent.id,
// 				tenantId: data.tenantId,
// 				admissionDate: data.admissionDate || new Date(),
// 				currentDate: new Date(),
// 				feeStructureId: data.feeStructureId,
// 				tx,
// 			})

// 			// Cache invalidate
// 			await nextjsCacheService.invalidate([
// 				CACHE_KEYS.STUDENTS.TAG(data.tenantId),
// 				CACHE_KEYS.STUDENT.TAG(newStudent.id),
// 				CACHE_KEYS.TENANT_DASHBOARD.TAG(data.tenantId),
// 			])

// 			// Return complete result
// 			return {
// 				message: 'Student created successfully',
// 				student: newStudent,
// 				duesCreated: duesResult,
// 			}
// 		},
// 		{
// 			maxWait: 60000,
// 			timeout: 60000,
// 		},
// 	)
// }

export const updateStudentService = async (
	id: string,
	data: UpdateStudentInput,
) => {
	const result = await studentDB.update(id, data)

	// Cache invalidate
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENTS.TAG(data.tenantId),
		CACHE_KEYS.STUDENT.TAG(result.id),
	])

	return result
}

// Service to apply late fees to existing dues (can be run as a cron job)
// export const applyLateFees = async (tenantId: string) => {
// 	return await prisma.$transaction(async tx => {
// 		const currentDate = new Date()

// 		// Get all pending/partial due items that might need late fees
// 		const pendingDueItems = await prisma.dueItem.findMany({
// 			where: {
// 				tenantId,
// 				status: {
// 					in: ['PENDING', 'PARTIAL'],
// 				},
// 				// Don't apply late fees to items that already have them
// 				adjustments: {
// 					none: {
// 						type: 'FINE',
// 						status: 'ACTIVE',
// 					},
// 				},
// 			},
// 			include: {
// 				due: {
// 					include: {
// 						student: {
// 							include: {
// 								feeStructure: {
// 									include: {
// 										feeItems: true,
// 									},
// 								},
// 							},
// 						},
// 					},
// 				},
// 			},
// 		})

// 		const adjustmentsToCreate = []

// 		for (const dueItem of pendingDueItems) {
// 			// Find the corresponding fee item
// 			const feeItem = dueItem.due.student.feeStructure?.feeItems.find(
// 				item => item.name === dueItem.title,
// 			)

// 			if (!feeItem) continue

// 			// Check if late fee should be applied
// 			if (
// 				shouldApplyLateFee(
// 					feeItem,
// 					dueItem.due.month,
// 					dueItem.due.year,
// 					currentDate,
// 				)
// 			) {
// 				const lateFeeAmount = calculateLateFeeAmount(
// 					feeItem,
// 					dueItem.due.month,
// 					dueItem.due.year,
// 					currentDate,
// 				)

// 				if (lateFeeAmount > 0) {
// 					adjustmentsToCreate.push({
// 						title: `Late Fee - ${feeItem.name}`,
// 						amount: new Decimal(lateFeeAmount),
// 						type: 'FINE' as const,
// 						status: 'ACTIVE' as const,
// 						reason: `Late payment for ${dueItem.due.month}/${dueItem.due.year}`,
// 						appliedBy: 'SYSTEM',
// 						dueItemId: dueItem.id,
// 						tenantId,
// 					})

// 					// Update final amount
// 					await dueItemDB.update(
// 						dueItem.id,
// 						{
// 							finalAmount: new Decimal(
// 								Number(dueItem.originalAmount) + lateFeeAmount,
// 							),
// 						},
// 						tx,
// 					)
// 				}
// 			}
// 		}

// 		// Create all adjustments
// 		if (adjustmentsToCreate.length > 0) {
// 			await dueAdjustmentDB.createManyAdjustment(adjustmentsToCreate, tx)
// 		}

// 		return {
// 			processed: pendingDueItems.length,
// 			lateFeesApplied: adjustmentsToCreate.length,
// 		}
// 	})
// }

// Service to recalculate due item final amounts based on adjustments
export const recalculateDueItemAmounts = async (dueItemId: string) => {
	return await prisma.$transaction(async tx => {
		const dueItem = await prisma.dueItem.findUnique({
			where: { id: dueItemId },
			include: {
				adjustments: {
					where: { status: 'ACTIVE' },
				},
			},
		})

		if (!dueItem) throw new Error('Due item not found')

		// Calculate final amount
		const totalAdjustments = dueItem.adjustments.reduce(
			(sum, adj) => sum + Number(adj.amount),
			0,
		)

		const finalAmount = Number(dueItem.originalAmount) + totalAdjustments

		// Update the due item
		await dueItemDB.update(
			dueItemId,
			{ finalAmount: new Decimal(finalAmount) } as UpdateDueItemInput,
			tx,
		)

		return finalAmount
	})
}

// Service to create monthly dues for existing students (can be run as a cron job)
export const createMonthlyDuesService = async (
	tenantId: string,
	month: number,
	year: number,
) => {
	return await prisma.$transaction(async tx => {
		// Get all active students in the tenant
		const students = await prisma.student.findMany({
			where: {
				tenantId,
				status: 'ACTIVE',
			},
			include: {
				feeStructure: {
					include: {
						feeItems: {
							where: { status: 'ACTIVE' },
						},
					},
				},
			},
		})

		const createdDues = []

		for (const student of students) {
			if (!student.feeStructure) continue

			// Check if due already exists for this month
			const existingDue = await prisma.studentDue.findUnique({
				where: {
					studentId_month_year: {
						studentId: student.id,
						month,
						year,
					},
				},
			})

			if (existingDue) continue // Skip if already exists

			// Create the due
			const due = await studentDueDB.create(
				{
					studentId: student.id,
					tenantId,
					month,
					year,
				},
				tx,
			)

			// Create due items with adjustments
			await createDueItemsWithAdjustments(
				due,
				student.feeStructure.feeItems as any,
				tenantId,
				tx,
			)

			createdDues.push(due)
		}

		return {
			studentsProcessed: students.length,
			duesCreated: createdDues.length,
		}
	})
}

export const deleteStudentService = async (id: string) => {
	const result = await studentDB.delete(id)

	//cachi invalidate
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENTS.TAG(result.tenantId),
		CACHE_KEYS.STUDENT.TAG(result.id),
	])

	return result
}

export const getStudentByIdService = async (id: string) => {
	const result = await studentDB.getById(id)

	if (!result) {
		return null
	}

	return result
}

export const getAllStudentService = async (tenantId: string) => {
	const result = await studentDB.getAll(tenantId)

	return result
}

export const getStudentsBySectionIdService = async (sectionId: string) => {
	const result = await studentDB.getBySectionId(sectionId)

	return result
}

export const getStudentsByClassIdService = async (classId: string) => {
	const result = await studentDB.getByClassId(classId)

	return result
}

// create student new implementation

interface CreateStudentInput {
	// Personal info
	photo?: string
	name: string
	roll: string
	email: string
	phone: string
	dateOfBirth: Date
	gender: Gender
	address: string
	religion: Religion

	// Academic info
	admissionDate: Date
	studentId: string

	// Family info
	fatherName: string
	motherName: string
	guardianPhone: string

	// Relations
	sessionId: string
	feeStructureId?: string
	sectionId: string
	classId: string
	tenantId: string
}

interface MonthYear {
	month: number
	year: number
}

/**
 * Calculate all months between admission date and current date
 * Uses the utility function from utils/get-months-between-dates.ts
 */
const calculateMonthsBetween = (
	admissionDate: Date,
	currentDate: Date,
): MonthYear[] => {
	return getMonthsBetween(admissionDate, currentDate)
}

/**
 * Determine if a due item should be created based on fee frequency
 */
const shouldCreateDueItem = (
	frequency: string,
	monthYear: MonthYear,
	admissionMonth: number,
	admissionYear: number,
): boolean => {
	switch (frequency) {
		case 'MONTHLY':
			return true
		case 'YEARLY':
			// Create yearly fees only in January or admission month
			return (
				monthYear.month === 1 ||
				(monthYear.month === admissionMonth && monthYear.year === admissionYear)
			)
		case 'QUARTERLY':
			// Create quarterly fees in Jan, Apr, Jul, Oct
			return [1, 4, 7, 10].includes(monthYear.month)
		case 'SEMESTER':
			// Create semester fees in Jan and Jul
			return [1, 7].includes(monthYear.month)
		case 'ONE_TIME':
			// One-time fees are created only in the admission month
			return (
				monthYear.month === admissionMonth && monthYear.year === admissionYear
			)
		default:
			return false
	}
}

/**
 * Create student due for a specific month
 */
const createStudentDueForMonth = async (
	tx: TransactionClient,
	studentId: string,
	feeItems: any[],
	monthYear: MonthYear,
	admissionDate: Date,
	tenantId: string,
) => {
	// Check if due already exists for this month
	const existingDue = await tx.studentDue.findUnique({
		where: {
			studentId_month_year: {
				studentId,
				month: monthYear.month,
				year: monthYear.year,
			},
		},
	})

	if (existingDue) {
		return // Skip if already exists
	}

	// Get admission month and year for one-time fee logic
	const admissionMonth = admissionDate.getMonth() + 1 // Convert to 1-based
	const admissionYear = admissionDate.getFullYear()

	// Create student due
	const studentDue = await tx.studentDue.create({
		data: {
			month: monthYear.month,
			year: monthYear.year,
			studentId,
			tenantId,
		},
	})

	// Create due items based on fee structure
	for (const feeItem of feeItems) {
		// Check if this due item should be created for this month
		const shouldCreate = shouldCreateDueItem(
			feeItem.frequency,
			monthYear,
			admissionMonth,
			admissionYear,
		)

		if (shouldCreate) {
			await tx.dueItem.create({
				data: {
					title: feeItem.name,
					originalAmount: feeItem.amount,
					finalAmount: feeItem.amount, // Initially same as original
					paidAmount: new Decimal(0),
					description: feeItem.description,
					categoryId: feeItem.categoryId,
					dueId: studentDue.id,
					tenantId,
					transactionCategoryId: feeItem.transactionCategoryId,
				},
			})
		}
	}
}

/**
 * Generate student dues from admission month to current month
 */
const generateStudentDues = async (
	tx: TransactionClient,
	studentId: string,
	feeStructureId: string,
	admissionDate: Date,
	tenantId: string,
) => {
	// Get fee structure with fee items
	const feeStructure = await tx.feeStructure.findUnique({
		where: { id: feeStructureId },
		include: {
			feeItems: {
				where: { status: 'ACTIVE' },
			},
		},
	})

	if (!feeStructure || !feeStructure.feeItems.length) {
		throw new Error('Fee structure not found or has no active fee items')
	}

	// Calculate months from admission to current
	const monthsToGenerate = calculateMonthsBetween(admissionDate, new Date())

	// Generate dues for each month
	for (const monthYear of monthsToGenerate) {
		await createStudentDueForMonth(
			tx,
			studentId,
			feeStructure.feeItems,
			monthYear,
			admissionDate,
			tenantId,
		)
	}
}

/**
 * Create a new student and generate dues from admission month to current month
 */
export const createStudentService = async (input: CreateStudentInput) => {
	return await prisma.$transaction(
		async tx => {
			// Convert string dates to Date objects if needed
			const admissionDate =
				input.admissionDate instanceof Date
					? input.admissionDate
					: new Date(input.admissionDate)

			const dateOfBirth =
				input.dateOfBirth instanceof Date
					? input.dateOfBirth
					: new Date(input.dateOfBirth)

			// Validate dates
			if (isNaN(admissionDate.getTime())) {
				throw new Error('Invalid admission date')
			}
			if (isNaN(dateOfBirth.getTime())) {
				throw new Error('Invalid date of birth')
			}

			// 1. Create the student
			const student = await tx.student.create({
				data: {
					photo: input.photo,
					name: input.name,
					roll: input.roll,
					email: input.email,
					phone: input.phone,
					dateOfBirth: dateOfBirth, // Use converted date
					gender: input.gender,
					address: input.address,
					religion: input.religion,
					admissionDate: admissionDate, // Use converted date
					studentId: input.studentId,
					fatherName: input.fatherName,
					motherName: input.motherName,
					guardianPhone: input.guardianPhone,
					sessionId: input.sessionId,
					feeStructureId: input.feeStructureId,
					sectionId: input.sectionId,
					classId: input.classId,
					tenantId: input.tenantId,
				},
			})

			// 2. Generate dues if fee structure is provided
			if (input.feeStructureId) {
				await generateStudentDues(
					tx,
					student.id,
					input.feeStructureId,
					admissionDate, // Pass the converted Date object
					input.tenantId,
				)
			}

			// 3. Create enrollment record
			await tx.studentEnrollment.create({
				data: {
					roll: input.roll,
					studentId: student.id,
					classId: input.classId,
					sectionId: input.sectionId,
					sessionId: input.sessionId,
					tenantId: input.tenantId,
					joinDate: admissionDate, // Use converted date
				},
			})

			// 4. Create user account
			await userDB.createUser(
				{
					name: input.name,
					email: input.email,
					status: 'ACTIVE',
					password: input.studentId,
					role: 'STUDENT',
					tenantId: input.tenantId,
				},
				tx,
			)

			// cache invalidate
			await nextjsCacheService.invalidate([
				CACHE_KEYS.STUDENTS.TAG(input.tenantId),
				CACHE_KEYS.STUDENT.TAG(student.id),
			])

			return student
		},
		{
			maxWait: 60000,
			timeout: 60000,
		},
	)
}

/**
 * Regenerate dues for a student (useful for fee structure changes)
 */
export const regenerateStudentDues = async (studentId: string) => {
	return await prisma.$transaction(async tx => {
		// Get student with fee structure
		const student = await tx.student.findUnique({
			where: { id: studentId },
			include: {
				feeStructure: {
					include: {
						feeItems: {
							where: { status: 'ACTIVE' },
						},
					},
				},
			},
		})

		if (!student || !student.feeStructure) {
			throw new Error('Student or fee structure not found')
		}

		// Delete existing unpaid dues
		await tx.studentDue.deleteMany({
			where: {
				studentId,
				dueItems: {
					every: {
						paidAmount: 0,
					},
				},
			},
		})

		// Regenerate dues
		await generateStudentDues(
			tx,
			studentId,
			student.feeStructureId!,
			student.admissionDate || new Date(),
			student.tenantId,
		)
	})
}

/**
 * Get student dues with payment status
 */
export const getStudentDues = async (studentId: string) => {
	return await prisma.studentDue.findMany({
		where: { studentId },
		include: {
			dueItems: {
				include: {
					category: true,
					adjustments: true,
					payments: true,
				},
			},
		},
		orderBy: [{ year: 'desc' }, { month: 'desc' }],
	})
}

/**
 * Calculate total outstanding dues for a student
 */
export const calculateOutstandingDues = async (studentId: string) => {
	const result = await prisma.dueItem.aggregate({
		where: {
			due: {
				studentId,
			},
			status: {
				not: 'PAID',
			},
		},
		_sum: {
			finalAmount: true,
			paidAmount: true,
		},
	})

	const totalDue = result._sum.finalAmount || new Decimal(0)
	const totalPaid = result._sum.paidAmount || new Decimal(0)

	return {
		totalDue,
		totalPaid,
		outstanding: totalDue.sub(totalPaid),
	}
}

/**
 * Update student fee structure and regenerate dues
 */
export const updateStudentFeeStructure = async (
	studentId: string,
	feeStructureId: string,
) => {
	return await prisma.$transaction(async tx => {
		// Update student fee structure
		await tx.student.update({
			where: { id: studentId },
			data: { feeStructureId },
		})

		// Regenerate dues
		await regenerateStudentDues(studentId)
	})
}

/**
 * Get monthly dues summary for a student
 */
export const getMonthlyDuesSummary = async (studentId: string) => {
	const dues = await prisma.studentDue.findMany({
		where: { studentId },
		include: {
			dueItems: {
				include: {
					adjustments: true,
				},
			},
		},
		orderBy: [{ year: 'asc' }, { month: 'asc' }],
	})

	return dues.map(due => {
		const totalOriginalAmount = due.dueItems.reduce(
			(sum, item) => sum.add(item.originalAmount),
			new Decimal(0),
		)

		const totalFinalAmount = due.dueItems.reduce(
			(sum, item) => sum.add(item.finalAmount),
			new Decimal(0),
		)

		const totalPaidAmount = due.dueItems.reduce(
			(sum, item) => sum.add(item.paidAmount),
			new Decimal(0),
		)

		const totalAdjustments = due.dueItems.reduce(
			(sum, item) =>
				sum.add(
					item.adjustments.reduce(
						(adjSum, adj) => adjSum.add(adj.amount),
						new Decimal(0),
					),
				),
			new Decimal(0),
		)

		return {
			month: due.month,
			year: due.year,
			totalOriginalAmount,
			totalFinalAmount,
			totalPaidAmount,
			totalAdjustments,
			outstanding: totalFinalAmount.sub(totalPaidAmount),
			isPaid: totalFinalAmount.equals(totalPaidAmount),
			dueItems: due.dueItems,
		}
	})
}

/**
 * Get overdue items for a student
 */
export const getOverdueItems = async (studentId: string) => {
	const currentDate = new Date()
	const currentMonth = currentDate.getMonth() + 1 // 1-based
	const currentYear = currentDate.getFullYear()

	return await prisma.dueItem.findMany({
		where: {
			due: {
				studentId,
				OR: [
					{ year: { lt: currentYear } },
					{
						year: currentYear,
						month: { lt: currentMonth },
					},
				],
			},
			status: {
				not: 'PAID',
			},
			finalAmount: {
				gt: prisma.dueItem.fields.paidAmount,
			},
		},
		include: {
			due: true,
			category: true,
			adjustments: true,
		},
		orderBy: [{ due: { year: 'asc' } }, { due: { month: 'asc' } }],
	})
}
