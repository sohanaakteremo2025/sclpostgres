import type { SearchParams } from '@/types'
import * as React from 'react'
import { queryModel } from '@/components/prisma-data-table'
import { StudentsTable } from '@/features/student-management/students/components/student-table'
import { getTenantId } from '@/lib/tenant'
import { CACHE_KEYS } from '@/constants/cache'
import { generateMissingDuesForAllStudents } from '@/features/financial-management/student-dues/services/auto-dues-generation.service'

interface StudentPageProps {
	searchParams: Promise<SearchParams>
}

export default async function StudentPage({ searchParams }: StudentPageProps) {
	const searchParamsData = await searchParams
	const tenantId = await getTenantId()

	// Auto-generate missing dues for all students when admin visits students page
	try {
		const duesGenResult = await generateMissingDuesForAllStudents(tenantId)
		if (duesGenResult.studentsUpdated > 0) {
			console.log(`Auto-generated dues for ${duesGenResult.studentsUpdated} students (${duesGenResult.totalDuesCreated} total dues created)`)
		}
	} catch (error) {
		console.error('Error auto-generating dues:', error)
	}

	const dataPromise = queryModel({
		model: 'student',
		searchParams: searchParamsData,
		tenantId,
		select: {
			id: true,
			name: true,
			photo: true,
			email: true,
			phone: true,
			dateOfBirth: true,
			gender: true,
			address: true,
			religion: true,
			roll: true,
			status: true,
			studentId: true,
			feeStructureId: true,
			sessionId: true,
			classId: true,
			sectionId: true,
			fatherName: true,
			motherName: true,
			guardianPhone: true,
			admissionDate: true,
			createdAt: true,
			tenantId: true,
			tenant: {
				select: {
					id: true,
					name: true,
					domain: true,
					logo: true,
					email: true,
					phone: true,
					address: true,
				},
			},
			studentDues: {
				select: {
					id: true,
					month: true,
					year: true,
					dueItems: {
						select: {
							id: true,
							title: true,
							originalAmount: true,
							finalAmount: true,
							paidAmount: true,
							category: true,
							status: true,
							adjustments: {
								select: {
									id: true,
									title: true,
									amount: true,
									type: true,
									reason: true,
									appliedBy: true,
									category: true,
									status: true,
									createdAt: true,
									updatedAt: true,
								},
							},
						},
					},
				},
			},
			section: {
				select: {
					id: true,
					name: true,
				},
			},
			class: {
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
			feeStructure: {
				select: {
					id: true,
					title: true,
					feeItems: {
						select: {
							id: true,
							name: true,
							amount: true,
							category: true,
							description: true,
							frequency: true,
							lateFeeEnabled: true,
							lateFeeFrequency: true,
							lateFeeAmount: true,
							lateFeeGraceDays: true,
							status: true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
			},
		},
		cacheOptions: {
			revalidate: 300,
			tags: [CACHE_KEYS.STUDENTS.TAG(tenantId)],
			cacheKey: CACHE_KEYS.STUDENTS.KEY(tenantId),
		},
	})

	return <StudentsTable dataPromise={dataPromise} />
}
