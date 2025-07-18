'use server'

import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth.action'
import { getSubdomainDB } from '@/lib/getSubdomainDB'
import { StudentAttendance } from '@prisma/client'
import { getSMSSettings, sendSMS } from './sms.action'
import { getTenantByDomain } from './tenant.action'
import { getStudentById } from './student.action'

// student attendance
// attendance by studentId for current date
export async function createStudentAttendanceByStudentId(studentId: string) {
	const prisma = await getSubdomainDB()
	const date = new Date()
	const student = await prisma.student.findUnique({
		where: { studentId },
	})
	try {
		if (!student) throw new Error('Student not found')
		await prisma.studentAttendance.create({
			data: {
				studentId: student.id,
				classId: student.classId,
				sectionId: student.sectionId,
				isPresent: true,
				date: format(date, 'yyyy-MM-dd'),
			},
		})
	} catch (error) {}
}

export async function toggleStudentAttendance({
	studentId,
	classId,
	sectionId,
	date,
	isPresent,
}: {
	studentId: string
	classId: string
	sectionId: string
	date: string
	isPresent: boolean
}) {
	try {
		const currentUser = await getCurrentUser()
		if (!currentUser) return null
		const prisma = await getSubdomainDB()
		const student = await getStudentById(studentId)
		const tenant = await getTenantByDomain()
		const smsNotificationConfig = await getSMSSettings()
		//check if student is already present
		const attendance = await prisma.studentAttendance.findFirst({
			where: {
				studentId,
				date,
			},
		})
		if (attendance) {
			await prisma.studentAttendance.update({
				where: {
					id: attendance.id,
				},
				data: {
					isPresent,
				},
			})

			revalidatePath('/dashboard/admin/attendance')
		} else {
			await prisma.studentAttendance.create({
				data: {
					tenantId: currentUser?.tenantId,
					classId,
					sectionId,
					studentId,
					isPresent,
					date,
				},
			})
			revalidatePath('/dashboard/admin/attendance')
		}

		const attendanceNotification = smsNotificationConfig?.settings.find(
			(setting: any) => setting.id === 'attendance',
		)
		if (!attendanceNotification?.enabled) {
			return {
				status: 'SKIPPED',
				message: 'Attendance SMS notifications are disabled',
			}
		}
		const today = new Date().toLocaleString()

		await sendSMS({
			number: student.guardianPhone,
			message: `Dear Parent, Your child, ${student.fullName}, was marked ${
				isPresent ? 'PRESENT' : 'ABSENT'
			} on ${today} in Class: ${student.class.name}, Section: ${
				student.section.name
			}. Best regards, ${tenant.name}`,
		})

		revalidatePath('/dashboard/admin/attendance')
		return JSON.parse(JSON.stringify(attendance))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

// employee attendance
export async function toggleAttendanceForEmployee({
	employeeId,
	date,
	isPresent,
}: {
	employeeId: string
	date: string
	isPresent: boolean
}) {
	try {
		const currentUser = await getCurrentUser()
		if (!currentUser) return null
		const prisma = await getSubdomainDB()
		const smsNotificationConfig = await getSMSSettings()
		const tenant = await getTenantByDomain()
		const employee = await prisma.employee.findUnique({
			where: {
				id: employeeId,
			},
		})
		//check if the employee is already present
		const attendance = await prisma.employeeAttendance.findFirst({
			where: {
				employeeId,
				date,
			},
		})
		if (attendance) {
			await prisma.employeeAttendance.update({
				where: {
					id: attendance.id,
				},
				data: {
					isPresent,
				},
			})
			revalidatePath('/dashboard/admin/employees-attendance')
		} else {
			await prisma.employeeAttendance.create({
				data: {
					tenantId: currentUser?.tenantId,
					employeeId,
					isPresent,
					date,
				},
			})
		}

		const attendanceNotification = smsNotificationConfig?.settings.find(
			(setting: any) => setting.id === 'attendance',
		)
		if (!attendanceNotification?.enabled) {
			return {
				status: 'SKIPPED',
				message: 'Attendance SMS notifications are disabled',
			}
		}
		const today = new Date().toLocaleString()

		await sendSMS({
			number: employee?.phone as string,
			message: `Dear ${employee?.fullName}, You were marked ${
				isPresent ? 'PRESENT' : 'ABSENT'
			} at ${today}
			Thank you.
			${tenant.name}.
			`,
		})

		revalidatePath('/dashboard/admin/attendance')
		return JSON.parse(JSON.stringify(attendance))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function getAllStudentAttendances(date: string) {
	const prisma = await getSubdomainDB()
	try {
		const attendances = await prisma.studentAttendance.findMany({
			where: {
				date,
			},
			include: {
				student: true,
				class: true,
				section: true,
			},
		})
		return JSON.parse(JSON.stringify(attendances))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function getStudentAttendancesThisMonth(): Promise<
	StudentAttendance[]
> {
	const prisma = await getSubdomainDB()
	try {
		const attendances = await prisma.studentAttendance.findMany({
			where: {
				date: {
					gte: format(
						new Date(new Date().getFullYear(), new Date().getMonth(), 1),
						'yyyy-MM-dd',
					),
					lte: format(
						new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
						'yyyy-MM-dd',
					),
				},
			},
		})
		return JSON.parse(JSON.stringify(attendances))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function getAllEmployeeAttendances(date: string) {
	const currentUser = await getCurrentUser()
	const prisma = await getSubdomainDB()
	try {
		const attendances = await prisma.employeeAttendance.findMany({
			where: {
				tenantId: currentUser?.tenantId,
				date,
			},
			include: {
				employee: true,
			},
		})
		return JSON.parse(JSON.stringify(attendances))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

//get total present this month for a student
export async function getTotalPresentThisMonth(studentId: string) {
	const currentUser = await getCurrentUser()
	const firstDayOfMonth = format(
		new Date(new Date().getFullYear(), new Date().getMonth(), 1),
		'yyyy-MM-dd',
	)
	const lastDayOfMonth = format(
		new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
		'yyyy-MM-dd',
	)

	const prisma = await getSubdomainDB()
	try {
		const attendances = await prisma.studentAttendance.findMany({
			where: {
				tenantId: currentUser?.tenantId,
				studentId,
				isPresent: true,
				date: {
					gte: firstDayOfMonth,
					lte: lastDayOfMonth,
				},
			},
		})
		return attendances.length || 0
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function getAttendancesForStudent(
	studentId: string,
	classId: string,
	sectionId: string,
	date: string,
	endDate: string,
) {
	const currentUser = await getCurrentUser()
	const prisma = await getSubdomainDB()
	try {
		const attendances = await prisma.studentAttendance.findMany({
			where: {
				tenantId: currentUser?.tenantId,
				studentId,
				classId,
				sectionId,
				date: {
					gte: date,
					lte: endDate,
				},
			},
		})
		return JSON.parse(JSON.stringify(attendances))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}

export async function getAttendancesForEmployee(
	employeeId: string,
	date: string,
	endDate: string,
) {
	const currentUser = await getCurrentUser()
	const prisma = await getSubdomainDB()
	try {
		const attendances = await prisma.employeeAttendance.findMany({
			where: {
				tenantId: currentUser?.tenantId,
				employeeId,
				date: {
					gte: date,
					lte: endDate,
				},
			},
		})
		return JSON.parse(JSON.stringify(attendances))
	} catch (error) {
		return JSON.parse(JSON.stringify(error))
	}
}
