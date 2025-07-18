// components/FeeAdditionSection.tsx
'use client'
import React, { useState, useMemo } from 'react'
import CardWrapper from '@/components/card-wrapper'
import FeeAdditionForm from './FeeAdditionForm'
import { useClassSectionCascade } from '@/hooks/queries/all-quries'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { queryClient } from '@/lib/query-client'

export default function FeeAdditionSection() {
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

	// Handle selection changes
	const handleClassChange = (classId: string) => {
		setSelectedClassId(classId)
	}

	const handleSectionChange = (sectionId: string) => {
		setSelectedSectionId(sectionId)
	}

	// Handle success callback
	const handleFeeAdditionSuccess = async () => {
		// Refetch all data after adding fees
		await refetchAll()
		queryClient.invalidateQueries({
			queryKey: ['student-dues'],
		})
	}

	// Loading state for initial data
	if (!isReady) {
		return (
			<CardWrapper
				title="Add New Fee"
				icon={<Plus className="w-6 h-6" />}
				description="Add fees to classes, sections, or individual students"
			>
				<div className="flex items-center justify-center py-8">
					<Loader2 className="w-8 h-8 animate-spin" />
					<span className="ml-2">Loading classes...</span>
				</div>
			</CardWrapper>
		)
	}

	// Error states
	const hasErrors = classesError || sectionsError || studentsError
	if (hasErrors) {
		return (
			<CardWrapper
				title="Add New Fee"
				icon={<Plus className="w-6 h-6" />}
				description="Add fees to classes, sections, or individual students"
			>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{classesError?.message ||
							sectionsError?.message ||
							studentsError?.message ||
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
			<FeeAdditionForm
				classes={classes}
				sections={sections}
				students={students}
				selectedClassId={selectedClassId}
				selectedSectionId={selectedSectionId}
				onClassChange={handleClassChange}
				onSectionChange={handleSectionChange}
				onSuccess={handleFeeAdditionSuccess}
				isLoadingClasses={isLoadingClasses}
				isLoadingSections={isLoadingSections}
				isLoadingStudents={isLoadingStudents}
			/>
		</CardWrapper>
	)
}
