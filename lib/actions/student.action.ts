'use server'

import { StudentFormSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '../getSubdomainDB'
import { Prisma } from '@prisma/client'
import { getPrismaClient, prisma } from '../db'
const globalPrisma = getPrismaClient()
import bcrypt from 'bcryptjs'

export async function createStudent(data: StudentFormSchema) {
	const prisma = await getSubdomainDB()
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId as string

	try {
		// Check if student already exists
		const studentExists = await prisma.student.findUnique({
			where: {
				studentId: data.studentId,
				tenantId,
			},
		})

		if (studentExists) {
			return new Response(
				JSON.stringify({ message: 'Student already exists' }),
				{ status: 400 },
			)
		}

		// Begin transaction to ensure both student and account are created
		const student = await prisma.student.create({
			data: { ...data, tenantId },
		})

		await prisma.lastStudentId.deleteMany({ where: { tenantId } })

		await prisma.lastStudentId.create({
			data: {
				tenantId,
				studentId: data.studentId,
			},
		})

		try {
			// Create account for student
			const accountData = {
				image: data.photo,
				tenantId,
				name: data.fullName,
				email: data.studentId,
				role: 'student',
				profileId: student.id,
			}

			const hashedPass = await bcrypt.hash(data.phone, 10)

			await globalPrisma.user.create({
				data: { ...accountData, password: hashedPass },
			})
		} catch (accountError) {
			// If account creation fails, delete the student record to maintain consistency
			await prisma.student.delete({
				where: { id: student.id },
			})

			console.error('Account creation error:', accountError)
			return new Response(
				JSON.stringify({ message: 'Failed to create account' }),
				{ status: 500 },
			)
		}

		revalidatePath('/dashboard/admin/students')
		return JSON.parse(JSON.stringify(student))
	} catch (error) {
		console.error('Create student error:', error)
		return { success: false, error: 'Failed to create student' }
	}
}

//
export async function getNextStudentIdNumber(): Promise<number> {
	const prisma = await getSubdomainDB()
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId as string
	try {
		// Get the most recent student ID for this tenant
		const lastStudentId = await prisma.lastStudentId.findFirst({
			where: {
				tenantId,
			},
		})

		// If no previous student ID exists, return 101 (assuming you want to start from 101)
		if (!lastStudentId) {
			return 101
		}

		// Extract the numeric part from the student ID (e.g., 'skcs-102' -> 102)
		const numericPart = extractNumericPart(lastStudentId.studentId)

		// Return the numeric part + 1
		return numericPart + 1
	} catch (error) {
		console.error('Error getting next student ID number:', error)
		throw new Error('Failed to get next student ID number')
	}
}

// Function to extract the numeric part from a student ID
function extractNumericPart(studentId: string): number {
	// Extract everything after the last hyphen
	const parts = studentId.split('-')

	if (parts.length > 1) {
		const numericPart = parts[parts.length - 1]
		const parsedNumber = parseInt(numericPart, 10)

		if (!isNaN(parsedNumber)) {
			return parsedNumber
		}
	}

	// Default to 100 if no valid number could be extracted
	return 100
}

// type
export type TStudentWithClassAndSection = Prisma.StudentGetPayload<{
	include: {
		class: true
		section: true
		feeStructure: { include: { fees: true } }
		paidFees: true
	}
}>

export const getAllStudents = async (): Promise<
	Prisma.StudentGetPayload<{
		include: {
			section: {
				include: {
					class: true
				}
			}
		}
	}>[]
> => {
	try {
		const students = await prisma.student.findMany({
			include: {
				section: {
					include: {
						class: true,
					},
				},
			},
		})

		return students // No need for JSON stringify/parse
	} catch (error) {
		console.error('Error fetching students:', error)
		throw new Error('Failed to fetch students')
	}
}

export async function deleteStudent(id: string) {
	const prisma = await getSubdomainDB()
	try {
		const student = await prisma.student.delete({ where: { id } })
		revalidatePath('/dashboard/admin/students')
		return JSON.parse(JSON.stringify(student))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function updateStudent(id: string, data: StudentFormSchema) {
	console.log('UPDATE DATA RECEIVED:', data)
	const prisma = await getSubdomainDB()
	const currentUser = await getCurrentUser()
	const tenantId = currentUser?.tenantId

	try {
		// First verify the student exists
		const existingStudent = await prisma.student.findUnique({
			where: { id },
		})

		if (!existingStudent) {
			return new Response(JSON.stringify({ message: 'Student not found' }), {
				status: 404,
			})
		}

		// Remove duplicate keys from your data
		const cleanedData = {
			photo: data.photo,
			fullName: data.fullName,
			email: data.email,
			phone: data.phone,
			studentId: data.studentId,
			gender: data.gender,
			religion: data.religion,
			dateOfBirth: data.dateOfBirth,
			address: data.address,
			feeStructureId: data.feeStructureId,
			admissionDate: data.admissionDate,
			classId: data.classId,
			sectionId: data.sectionId,
			guardianName: data.guardianName,
			relationship: data.relationship,
			guardianPhone: data.guardianPhone,
			guardianOccupation: data.guardianOccupation,
			fatherName: data.fatherName,
			motherName: data.motherName,
			tenantId,
		}

		// Check for duplicate student ID
		const duplicateCheck = await prisma.student.findFirst({
			where: {
				studentId: cleanedData.studentId,
				classId: cleanedData.classId,
				sectionId: cleanedData.sectionId,
				NOT: { id },
			},
		})

		if (duplicateCheck) {
			return new Response(
				JSON.stringify({
					message: 'Student ID already exists in this class and section',
				}),
				{ status: 400 },
			)
		}

		// Update student
		const updatedStudent = await prisma.student.update({
			where: { id },
			data: cleanedData,
		})

		// Update associated account
		try {
			await prisma.user.updateMany({
				where: {
					profileId: id,
					tenantId,
				},
				data: {
					image: data.photo,
					name: data.fullName,
					email: data.studentId,
					password: data.phone,
				},
			})
		} catch (accountError) {
			console.error('Account update error:', accountError)
			// Continue even if account update fails
		}

		revalidatePath('/dashboard/admin/students')
		return JSON.parse(JSON.stringify(updatedStudent))
	} catch (error) {
		console.error('Update student error:', error)
		throw new Error('Failed to update student')
	}
}

export async function getStudentByStudentId(studentId: string) {
	const prisma = await getSubdomainDB()
	try {
		const student = await prisma.student.findUnique({
			where: { studentId },
			include: {
				class: true,
				section: true,
			},
		})
		return JSON.parse(JSON.stringify(student))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const getStudentById = async (
	id: string,
): Promise<TStudentWithClassAndSection> => {
	const prisma = await getSubdomainDB()
	try {
		const student = await prisma.student.findUnique({
			where: { id },
			include: {
				class: true,
				section: true,
				feeStructure: {
					include: {
						fees: true,
					},
				},
				paidFees: true,
			},
		})
		return JSON.parse(JSON.stringify(student))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export const promoteStudent = async ({
	studentId,
	classId,
	sectionId,
	feeStructureId,
}: {
	studentId: string
	classId: string
	sectionId: string
	feeStructureId: string
}) => {
	const prisma = await getSubdomainDB()
	try {
		const student = await prisma.student.update({
			where: { id: studentId },
			data: {
				classId,
				sectionId,
				feeStructureId,
			},
		})
		revalidatePath('/dashboard/admin/students')
		return JSON.parse(JSON.stringify(student))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
