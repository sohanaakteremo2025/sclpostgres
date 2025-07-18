'use client'
import CardWrapper from '@/components/card-wrapper'
import { GraduationCap } from 'lucide-react'
import React from 'react'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/columns'
import StudentRegistrationDialogue from './_components/RegistrationDialogue'
import { TStudentWithClassAndSection } from '@/lib/actions/student.action'
import { useTenantStore } from '@/store/datastore'
import { useEffect } from 'react'

export default function Students() {
	const { students, fees, fetchStudents, fetchFees, isLoading } = useTenantStore()
	useEffect(() => {
		fetchStudents()
		fetchFees()
	}, [fetchStudents, fetchFees])

	const updatedStudents = Object.values(students).map(student => {
		const feeRecord = Object.values(fees).find(fee => fee.studentId === student.id);
		return {
		  ...student,
		  unpaidMonths: getMonthsBetweenDates()
		};
	  });

	  function getMonthsBetweenDates(startDate:any, endDate:any) {
		const months = [];
		const current = new Date(startDate);
		current.setDate(1); // Normalize to the 1st day of the month

		const end = new Date(endDate);
		end.setDate(1); // Normalize to the 1st day of the month

		while (current <= end) {
		  const month = current.toLocaleString("default", { month: "long" });
		  const year = current.getFullYear();
		  months.push(`${month} ${year}`);
		  current.setMonth(current.getMonth() + 1); // Move to the next month
		}

		return months;
	  }

	const flatStudents = Object.values(updatedStudents).map(
		(data:any) => ({
			id: data.id,
			fullName: data?.fullName || '',
			dateOfBirth: data?.dateOfBirth || undefined,
			gender: data?.gender || '',
			phone: data?.phone || '',
			address: data?.address || '',
			email: data?.email || '',
			photo: data?.photo || '',
			studentId: data?.studentId || '',
			religion: data?.religion || '',
			monthlyFee: data?.monthlyFee || 0,
			classId: data?.classId || '',
			sectionId: data?.sectionId || '',
			guardianName: data?.guardianName || '',
			relationship: data?.relationship || '',
			guardianPhone: data?.guardianPhone || '',
			guardianEmail: data?.guardianEmail || '',
			guardianOccupation: data?.guardianOccupation || '',
			fatherName: data?.fatherName || '',
			motherName: data?.motherName || '',
			class: data?.class?.name || '',
			section: data?.section?.name || '',
			lastPaid: data?.month
		}),
	)

	console.log("Flat Students data", flatStudents)
	return (
		<CardWrapper
			header={
				<div className="flex items-center justify-between gap-2 w-full">
					<div className="flex items-center gap-3">
						<GraduationCap className="w-7 h-7 text-primary" /> Students
					</div>
					<div>
						<StudentRegistrationDialogue />
					</div>
				</div>
			}
			description="Manage your students and their records"
		>
			<DataTable
				columns={columns}
				data={flatStudents}
				filter={['class', 'section']}
				isLoading={isLoading.students}
				searchKey="fullName"
			/>
		</CardWrapper>
	)
}
