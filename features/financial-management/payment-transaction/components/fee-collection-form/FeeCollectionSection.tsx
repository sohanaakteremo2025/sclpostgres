'use client'
import CardWrapper from '@/components/card-wrapper'
import { FormProvider, FormRoot, FormSelect } from '@/components/school-form'
import MultiMonthFeeCollectionForm from '@/features/financial-management/payment-transaction/components/fee-collection-form/MultiMonthFeeCollectionForm'
import {
	useClassSectionCascade,
	useStudentDues,
} from '@/hooks/queries/all-quries'
import { HandCoins, Loader2, AlertCircle } from 'lucide-react'
import React, { useState, useMemo, useEffect } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ensureStudentDuesUpToDateAction } from '@/features/financial-management/student-dues/api/auto-dues.action'
import { useToast } from '@/hooks/use-toast'

const SelectionSchema = z.object({
	classId: z.string(),
	sectionId: z.string(),
	studentId: z.string(),
})

export default function FeeCollectionSection() {
	const [selectedStudentId, setSelectedStudentId] = useState<string>('')
	const [isGeneratingDues, setIsGeneratingDues] = useState(false)
	const { toast } = useToast()

	const {
		classes,
		sections,
		students,
		selectedClassId,
		selectedSectionId,
		setSelectedClassId,
		setSelectedSectionId,
		isLoadingClasses,
		isLoadingSections,
		isLoadingStudents,
		refetchAll,
		isReady,
		classesError,
		sectionsError,
		studentsError,
	} = useClassSectionCascade()

	// Only fetch student dues when we have a selected student
	const {
		data: studentDuesData,
		isLoading: isLoadingStudentDues,
		error: studentDuesError,
		refetch: refetchStudentDues,
	} = useStudentDues(selectedStudentId)

	// Memoize the student dues object for the form component
	const studentDues = useMemo(() => {
		if (!studentDuesData || !selectedStudentId) return null
		return {
			dues: studentDuesData,
			studentId: selectedStudentId,
		}
	}, [studentDuesData, selectedStudentId])

	// Handle selection changes
	const handleClassChange = (classId: string) => {
		setSelectedClassId(classId)
	}

	const handleSectionChange = (sectionId: string) => {
		setSelectedSectionId(sectionId)
	}

	const handleStudentChange = async (studentId: string) => {
		setSelectedStudentId(studentId)
		
		// Auto-generate missing dues when a student is selected
		if (studentId) {
			setIsGeneratingDues(true)
			try {
				const result = await ensureStudentDuesUpToDateAction(studentId)
				if (result.success && result.data.needsUpdate && result.data.result?.success) {
					toast({
						title: 'Dues Updated',
						description: `Generated ${result.data.result.duesCreated} missing dues for this student`,
					})
					// Refetch student dues to show updated data
					await refetchStudentDues()
				} else if (result.success && result.data.needsUpdate && result.data.result && !result.data.result.success) {
					toast({
						title: 'Warning',
						description: result.data.result.message,
						variant: 'destructive',
					})
				}
			} catch (error) {
				console.error('Error generating dues:', error)
				toast({
					title: 'Error',
					description: 'Failed to generate missing dues',
					variant: 'destructive',
				})
			} finally {
				setIsGeneratingDues(false)
			}
		}
	}

	// Handle success callback from fee collection form
	const handleFeeCollectionSuccess = async () => {
		// Refetch student dues to get updated data
		await refetchStudentDues()
		// Optionally refetch cascade data if needed
		// await refetchAll()
	}

	// Loading state for initial data
	if (!isReady) {
		return (
			<CardWrapper
				title="Fees Collection"
				icon={<HandCoins className="w-6 h-6" />}
				description="Manage your fees collection"
			>
				<div className="flex items-center justify-center py-8">
					<Loader2 className="w-8 h-8 animate-spin" />
					<span className="ml-2">Loading classes...</span>
				</div>
			</CardWrapper>
		)
	}

	// Error states
	const hasErrors =
		classesError || sectionsError || studentsError || studentDuesError
	if (hasErrors) {
		return (
			<CardWrapper
				title="Fees Collection"
				icon={<HandCoins className="w-6 h-6" />}
				description="Manage your fees collection"
			>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{classesError?.message ||
							sectionsError?.message ||
							studentsError?.message ||
							studentDuesError?.message ||
							'An error occurred while loading data'}
					</AlertDescription>
				</Alert>
				<button
					onClick={() => refetchAll()}
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Retry
				</button>
			</CardWrapper>
		)
	}

	return (
		<CardWrapper className="shadow-none border-0">
			{/* Student Selection Form */}
			<CardWrapper title="Fee Collection">
				<FormProvider
					schema={SelectionSchema}
					onSubmit={async values => {
						// This form is just for selection, actual submission happens in MultiMonthFeeCollectionForm
						console.log('Selection values:', values)
						return {
							success: true,
							message: 'Student selected successfully',
						}
					}}
				>
					<FormRoot>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<FormSelect
								name="classId"
								label="Class"
								placeholder="Select Class"
								isLoading={isLoadingClasses}
								options={classes}
								onChange={handleClassChange}
							/>

							<FormSelect
								name="sectionId"
								label="Section"
								placeholder="Select Section"
								isLoading={isLoadingSections}
								disabled={!selectedClassId}
								options={sections}
								onChange={handleSectionChange}
							/>

							<FormSelect
								name="studentId"
								label="Student"
								placeholder="Select Student"
								isLoading={isLoadingStudents}
								disabled={!selectedSectionId}
								options={students}
								onChange={handleStudentChange}
							/>
						</div>
					</FormRoot>
				</FormProvider>
			</CardWrapper>

			{/* Loading state for dues generation */}
			{selectedStudentId && isGeneratingDues && (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="w-6 h-6 animate-spin" />
					<span className="ml-2">Generating missing dues...</span>
				</div>
			)}

			{/* Loading state for student dues */}
			{selectedStudentId && isLoadingStudentDues && !isGeneratingDues && (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="w-6 h-6 animate-spin" />
					<span className="ml-2">Loading student dues...</span>
				</div>
			)}

			{/* Fee Collection Form */}
			{selectedStudentId && studentDues && !isLoadingStudentDues && !isGeneratingDues && (
				<div className="mt-6">
					<MultiMonthFeeCollectionForm
						dues={studentDues as any}
						onSuccess={handleFeeCollectionSuccess}
					/>
				</div>
			)}

			{/* No student selected state */}
			{!selectedStudentId && (
				<div className="text-center py-8 text-gray-500">
					Please select a student to view and collect fees
				</div>
			)}

			{/* No dues available state */}
			{selectedStudentId && studentDues && studentDues.dues.length === 0 && (
				<div className="text-center py-8 text-gray-500">
					No outstanding dues found for this student
				</div>
			)}
		</CardWrapper>
	)
}
