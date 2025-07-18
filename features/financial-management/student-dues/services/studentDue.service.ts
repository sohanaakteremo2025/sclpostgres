// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { studentDueDB } from '../db/studentDue.repository'
import {
	CreateStudentDuePayload,
	DueItemStatusSchema,
	UpdateStudentDueInput,
} from '@/lib/zod'
import {
	CreateStudentDuesParams,
	DueCreationResult,
	FeeAdditionInput,
	FeeAdditionSchema,
} from '../types/types'
import { studentDB } from '@/features/student-management/students/db/student.repository'
import { prisma } from '@/lib/db'
import { TransactionClient } from '@/types'
import Decimal from 'decimal.js'
import { dueItemDB } from '../../dueItem/db/duitem.repository'
import { generateLateFeeAdjustment } from '@/utils/late-fee-utils'
import { dueAdjustmentDB } from '../../dueAdjustment/db/dueAdjustment.repository'
import { feeItemDB } from '../../feeItem/db/fee.repository'
import { getMonthsBetween } from '@/utils/get-months-between-dates'

export async function createStudentDueService({
	data,
}: {
	data: CreateStudentDuePayload
}) {
	const result = await studentDueDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_DUES.TAG(data.tenantId),
	])

	return result
}

export async function getAllStudentDuesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => studentDueDB.getAllStudentDues(tenantId),
		{
			key: CACHE_KEYS.STUDENT_DUES.KEY(tenantId),
			tags: [CACHE_KEYS.STUDENT_DUES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getStudentDueByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => studentDueDB.getStudentDueById(id),
		{
			key: CACHE_KEYS.STUDENT_DUE.KEY(id),
			tags: [CACHE_KEYS.STUDENT_DUE.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function getStudentDueByStudentIdService({
	studentId,
}: {
	studentId: string
}) {
	return await studentDueDB.getStudentDueByStudentId(studentId)
}

export async function updateStudentDueService({
	id,
	data,
}: {
	id: string
	data: UpdateStudentDueInput
}) {
	const existing = await studentDueDB.getStudentDueById(id)
	if (!existing) {
		throw new Error('Student Due not found')
	}

	const result = await studentDueDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_DUES.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_DUE.TAG(id),
	])

	return result
}

export async function deleteStudentDueService({ id }: { id: string }) {
	const existing = await studentDueDB.getStudentDueById(id)
	if (!existing) {
		throw new Error('Student Due not found')
	}

	await studentDueDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_DUES.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_DUE.TAG(id),
	])
}

export async function addFeeToTargetService({
	data,
	tenantId,
}: {
	data: FeeAdditionInput
	tenantId: string
}) {
	const validatedInput = FeeAdditionSchema.parse(data)
	const { targetType, classId, sectionId, studentId, feeDetails } =
		validatedInput

	let targetStudents: string[] = []

	// Determine target students based on target type
	switch (targetType) {
		case 'CLASS':
			// Get all students in the class
			const classStudents = await studentDB.getByClassId(classId)
			targetStudents = classStudents.map(s => s.id)
			break

		case 'SECTION':
			if (!sectionId) {
				throw new Error('Section ID is required for section-level fee addition')
			}
			// Get all students in the section
			const sectionStudents = await studentDB.getBySectionId(sectionId)
			targetStudents = sectionStudents.map(s => s.id)
			break

		case 'STUDENT':
			if (!studentId) {
				throw new Error('Student ID is required for individual fee addition')
			}
			targetStudents = [studentId]
			break

		default:
			throw new Error('Invalid target type')
	}

	if (targetStudents.length === 0) {
		throw new Error('No students found for the specified target')
	}

	// Use transaction to ensure data consistency
	const result = await prisma.$transaction(async tx => {
		const createdDues = []

		for (const studentId of targetStudents) {
			// Check if StudentDue already exists for this student, month, and year
			let studentDue = await tx.studentDue.findUnique({
				where: {
					studentId_month_year: {
						studentId,
						month: feeDetails.month,
						year: feeDetails.year,
					},
				},
			})

			// Create StudentDue if it doesn't exist
			if (!studentDue) {
				studentDue = await tx.studentDue.create({
					data: {
						studentId,
						month: feeDetails.month,
						year: feeDetails.year,
						tenantId,
					},
				})
			}

			// Create the DueItem
			const dueItem = await tx.dueItem.create({
				data: {
					title: feeDetails.title,
					originalAmount: feeDetails.originalAmount,
					finalAmount: feeDetails.originalAmount, // Initially same as original
					paidAmount: 0,
					description: feeDetails.description || '',
					status: DueItemStatusSchema.enum.PENDING,
					categoryId: feeDetails.categoryId,
					dueId: studentDue.id,
					tenantId,
				},
			})

			createdDues.push({
				studentDueId: studentDue.id,
				dueItemId: dueItem.id,
				studentId,
			})
		}

		return {
			success: true,
			message: `Fee added successfully to ${targetStudents.length} student(s)`,
			createdDues,
		}
	})

	// Revalidate relevant paths
	nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENTS.TAG(tenantId),
		CACHE_KEYS.STUDENT_DUES.TAG(tenantId),
		CACHE_KEYS.PAYMENT_TRANSACTIONS.TAG(tenantId),
	])

	return result
}

// Create due items with adjustments (internal helper)
const createDueItemsWithAdjustments = async (
	due: any,
	feeItems: any[],
	tenantId: string,
	tx: TransactionClient,
) => {
	const dueItemsToCreate = []
	const adjustmentsToCreate = []

	for (const feeItem of feeItems) {
		const dueItemData = {
			title: feeItem.name,
			originalAmount: feeItem.amount,
			finalAmount: feeItem.amount,
			paidAmount: new Decimal(0),
			description: feeItem.description,
			category: feeItem.category,
			status: 'PENDING' as const,
			dueId: due.id,
			tenantId,
		}

		dueItemsToCreate.push(dueItemData)
	}

	const createdDueItems = await dueItemDB.createManyDueItem(
		dueItemsToCreate,
		tx,
	)

	for (let i = 0; i < createdDueItems.length; i++) {
		const dueItem = createdDueItems[i]
		const feeItem = feeItems[i]

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

			await dueItemDB.update(
				dueItem.id,
				{
					finalAmount: new Decimal(
						Number(dueItem.originalAmount) + lateFeeAdjustment.amount,
					),
				} as any,
				tx,
			)
		}
	}

	if (adjustmentsToCreate.length > 0) {
		await dueAdjustmentDB.createManyDueAdjustment(adjustmentsToCreate, tx)
	}

	return createdDueItems
}

const createDueItemsWithAdjustmentsBatch = async (
	createdDues: any[],
	feeItems: any[],
	tenantId: string,
	tx: TransactionClient,
) => {
	const allDueItemsToCreate = []
	const allAdjustmentsToCreate = []
	const allDueItemUpdates = []

	// Prepare all data first
	for (const due of createdDues) {
		for (const feeItem of feeItems) {
			const dueItemData = {
				title: feeItem.name,
				originalAmount: feeItem.amount,
				finalAmount: feeItem.amount,
				paidAmount: new Decimal(0),
				description: feeItem.description,
				category: feeItem.category,
				status: 'PENDING' as const,
				dueId: due.id,
				tenantId,
			}

			allDueItemsToCreate.push({
				...dueItemData,
				_dueMonth: due.month,
				_dueYear: due.year,
				_feeItem: feeItem,
			})
		}
	}

	// Create all due items in batch
	const createdDueItems = await dueItemDB.createManyDueItem(
		allDueItemsToCreate.map(item => {
			const { _dueMonth, _dueYear, _feeItem, ...dueItemData } = item
			return dueItemData
		}),
		tx,
	)

	// Process adjustments
	for (let i = 0; i < createdDueItems.length; i++) {
		const dueItem = createdDueItems[i]
		const originalData = allDueItemsToCreate[i]
		const feeItem = originalData._feeItem

		const lateFeeAdjustment = generateLateFeeAdjustment(
			feeItem,
			originalData._dueMonth,
			originalData._dueYear,
		)

		if (lateFeeAdjustment) {
			allAdjustmentsToCreate.push({
				...lateFeeAdjustment,
				amount: new Decimal(lateFeeAdjustment.amount),
				dueItemId: dueItem.id,
				tenantId,
			})

			allDueItemUpdates.push({
				id: dueItem.id,
				finalAmount: new Decimal(
					Number(dueItem.originalAmount) + lateFeeAdjustment.amount,
				),
			})
		}
	}

	// Batch operations
	const operations = []

	if (allAdjustmentsToCreate.length > 0) {
		operations.push(
			dueAdjustmentDB.createManyDueAdjustment(allAdjustmentsToCreate, tx),
		)
	}

	if (allDueItemUpdates.length > 0) {
		operations.push(
			Promise.all(
				allDueItemUpdates.map(update =>
					dueItemDB.update(
						update.id,
						{ finalAmount: update.finalAmount } as any,
						tx,
					),
				),
			),
		)
	}

	// Execute all operations in parallel
	await Promise.all(operations)

	return createdDueItems
}

/**
 * Creates student dues for months between admission date and current date
 * Skips months that already have dues created
 * Can be used with or without existing transaction
 */
export const createStudentDuesService = async (
	params: CreateStudentDuesParams,
): Promise<DueCreationResult> => {
	const executeLogic = async (tx: TransactionClient) => {
		// Get student with enrollment info
		const student = await tx.student.findUnique({
			where: {
				id: params.studentId,
				tenantId: params.tenantId,
			},
			include: {
				enrollments: {
					where: { status: 'ENROLLED' },
					orderBy: { joinDate: 'desc' },
					take: 1,
				},
			},
		})

		if (!student) {
			throw new Error('Student not found')
		}

		// Determine fee structure ID
		let feeStructureId = params.feeStructureId

		if (!feeStructureId) {
			// Try to get from student record or enrollment
			feeStructureId = (student as any).feeStructureId
		}

		if (!feeStructureId) {
			throw new Error('Fee structure ID not provided and not found on student')
		}

		// Get fee items
		const feeItems =
			await feeItemDB.getAllFeeItemsByFeeStructureId(feeStructureId)

		if (!feeItems || feeItems.length === 0) {
			throw new Error('No fee items found for the fee structure')
		}

		// Parse and validate dates
		const admissionDate = new Date(params.admissionDate)
		const currentDate = new Date(params.currentDate || new Date())

		if (admissionDate > currentDate) {
			throw new Error('Admission date cannot be after current date')
		}

		// Get all months between dates
		const allMonthsToCreate = getMonthsBetween(admissionDate, currentDate)

		// Get existing dues
		const existingDues = await tx.studentDue.findMany({
			where: {
				studentId: params.studentId,
				tenantId: params.tenantId,
			},
			select: {
				month: true,
				year: true,
			},
		})

		// Filter out existing months
		const existingDuesSet = new Set(
			existingDues.map(due => `${due.month}-${due.year}`),
		)

		const monthsToCreate = allMonthsToCreate.filter(
			monthYear => !existingDuesSet.has(`${monthYear.month}-${monthYear.year}`),
		)

		// Early return if no new dues needed
		if (monthsToCreate.length === 0) {
			return {
				message: 'No new dues to create - all months already have dues',
				createdDuesCount: 0,
				skippedDuesCount: allMonthsToCreate.length,
				totalDueItemsCreated: 0,
				monthsCreated: [],
				monthsSkipped: allMonthsToCreate.map(m => `${m.month}/${m.year}`),
			}
		}

		// Create new dues
		const studentDuesToCreate = monthsToCreate.map(monthYear => ({
			studentId: params.studentId,
			tenantId: params.tenantId,
			month: monthYear.month,
			year: monthYear.year,
		}))

		const createdDues = await studentDueDB.createManyDue(
			studentDuesToCreate,
			tx,
		)

		// Create due items for each due
		let totalDueItemsCreated = 0
		for (const due of createdDues) {
			const dueItems = await createDueItemsWithAdjustments(
				due,
				feeItems,
				params.tenantId,
				tx,
			)
			totalDueItemsCreated += dueItems.length
		}

		// Prepare result
		const result: DueCreationResult = {
			message: `Successfully created ${createdDues.length} new dues with ${totalDueItemsCreated} due items`,
			createdDuesCount: createdDues.length,
			skippedDuesCount: allMonthsToCreate.length - monthsToCreate.length,
			totalDueItemsCreated,
			monthsCreated: monthsToCreate.map(m => `${m.month}/${m.year}`),
			monthsSkipped: allMonthsToCreate
				.filter(m => existingDuesSet.has(`${m.month}-${m.year}`))
				.map(m => `${m.month}/${m.year}`),
		}

		return result
	}

	// Use provided transaction or create new one
	if (params.tx) {
		return await executeLogic(params.tx)
	} else {
		return await prisma.$transaction(async tx => {
			const result = await executeLogic(tx)

			// Cache invalidation (only if not in external transaction)
			await nextjsCacheService.invalidate([
				CACHE_KEYS.STUDENTS.TAG(params.tenantId),
				CACHE_KEYS.STUDENT.TAG(params.studentId),
				CACHE_KEYS.TENANT_DASHBOARD.TAG(params.tenantId),
			])

			return result
		})
	}
}

/**
 * Batch create dues for multiple students
 */
export const createBatchStudentDuesService = async (
	studentsParams: CreateStudentDuesParams[],
) => {
	const results = []

	for (const studentParams of studentsParams) {
		try {
			const result = await createStudentDuesService(studentParams)
			results.push({
				studentId: studentParams.studentId,
				success: true,
				data: result,
			})
		} catch (error) {
			results.push({
				studentId: studentParams.studentId,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}

	return {
		totalProcessed: results.length,
		successful: results.filter(r => r.success).length,
		failed: results.filter(r => !r.success).length,
		results,
	}
}
