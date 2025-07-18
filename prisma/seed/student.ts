import { PrismaClient } from '@prisma/client'
import { SEED_CONFIG } from './config'
import { logProgress, checkTenantExists } from './utils'

const prisma = new PrismaClient()

export async function seedStudent(tenantId: string = SEED_CONFIG.TENANT_ID) {
	try {
		logProgress('🎓 Starting student seeding')

		// Verify tenant exists
		await checkTenantExists(tenantId)

		// 1. Create Academic Session
		logProgress('📚 Creating academic session')
		const academicSession = await prisma.academicSession.upsert({
			where: {
				title_tenantId: {
					title: '2024-2025',
					tenantId: tenantId,
				},
			},
			update: {},
			create: {
				title: '2024-2025',
				startDate: new Date('2024-01-01'),
				endDate: new Date('2024-12-31'),
				status: 'ONGOING',
				tenantId: tenantId,
			},
		})

		// 2. Create Class
		logProgress('🏫 Creating class structure')
		const studentClass = await prisma.class.upsert({
			where: {
				name_tenantId: {
					name: 'Class 10',
					tenantId: tenantId,
				},
			},
			update: {},
			create: {
				name: 'Class 10',
				tenantId: tenantId,
			},
		})

		// 3. Create Section
		const section = await prisma.section.upsert({
			where: {
				name_classId: {
					name: 'A',
					classId: studentClass.id,
				},
			},
			update: {},
			create: {
				name: 'A',
				classId: studentClass.id,
				tenantId: tenantId,
			},
		})

		// 4. Create Subjects
		logProgress('📖 Creating subjects')
		const subjects = [
			{ name: 'Mathematics', code: 'MATH101', type: 'COMPULSORY' },
			{ name: 'English', code: 'ENG101', type: 'COMPULSORY' },
			{ name: 'Science', code: 'SCI101', type: 'COMPULSORY' },
			{ name: 'Social Studies', code: 'SS101', type: 'COMPULSORY' },
			{ name: 'Computer Science', code: 'CS101', type: 'ELECTIVE' },
		]

		for (const subject of subjects) {
			await prisma.subject.upsert({
				where: {
					name_classId: {
						name: subject.name,
						classId: studentClass.id,
					},
				},
				update: {},
				create: {
					name: subject.name,
					code: subject.code,
					type: subject.type as any,
					classId: studentClass.id,
					sectionId: section.id,
					tenantId: tenantId,
				},
			})
		}

		// 5. Create Fee Structure
		logProgress('💰 Creating fee structure')
		const feeStructure = await prisma.feeStructure.upsert({
			where: {
				title_tenantId: {
					title: 'Standard Fee Structure 2024',
					tenantId: tenantId,
				},
			},
			update: {},
			create: {
				title: 'Standard Fee Structure 2024',
				tenantId: tenantId,
			},
		})

		// 6. Create Fee Items
		const feeItems = [
			{
				name: 'Admission Fee',
				amount: 5000.0,
				frequency: 'ONE_TIME',
				lateFeeEnabled: false,
			},
			{
				name: 'Monthly Tuition',
				amount: 2000.0,
				frequency: 'MONTHLY',
				lateFeeEnabled: true,
				lateFeeAmount: 100.0,
				lateFeeFrequency: 'DAILY',
			},
		]

		for (const feeItem of feeItems) {
			await prisma.feeItem.create({
				data: {
					...feeItem,
					frequency: feeItem.frequency as any,
					lateFeeFrequency: feeItem.lateFeeFrequency as any,
					feeStructureId: feeStructure.id,
				},
			})
		}

		// 7. Create Student
		logProgress('👤 Creating student record')
		const student = await prisma.student.create({
			data: {
				name: 'John Doe',
				roll: '001',
				classId: studentClass.id,
				email: 'john.doe@example.com',
				phone: '+8801712345678',
				dateOfBirth: new Date('2008-05-15'),
				gender: 'MALE',
				address: '123 Main Street, Chittagong, Bangladesh',
				religion: 'ISLAM',
				admissionDate: new Date(),
				studentId: 'STU2024001',
				fatherName: 'Robert Doe',
				motherName: 'Jane Doe',
				guardianPhone: '+8801712345679',
				status: 'ACTIVE',
				sessionId: academicSession.id,
				feeStructureId: feeStructure.id,
				sectionId: section.id,
				tenantId: tenantId,
			},
		})

		logProgress(
			'✅ Student seeding completed',
			`Created student: ${student.name}`,
		)
		return { student, academicSession, studentClass, section, feeStructure }
	} catch (error: any) {
		logProgress('❌ Student seeding failed', error.message)
		throw error
	}
}
