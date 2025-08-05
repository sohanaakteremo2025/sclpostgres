'use client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { useStudentsForExam } from '@/hooks/queries/all-quries'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ResultEntryForm } from './result-entry-form'

// Import API functions
import { getExistingResultsForEntry } from '../api/result-entry.action'

const fetchExistingResults = async (examScheduleId: string) => {
	const result = await getExistingResultsForEntry(examScheduleId)
	if (!result.success) {
		throw new Error(result.error)
	}
	return result.data
}

interface ResultEntryManageDialogProps {
	examSchedule: any
	onSuccess: () => void
}

export default function ResultEntryManageDialog({
	examSchedule,
	onSuccess,
}: ResultEntryManageDialogProps) {
	const [loading, setLoading] = useState(false)

	// Debug: Log the examSchedule to see what classId we're getting
	console.log('ResultEntryManageDialog - examSchedule:', {
		classId: examSchedule.classId,
		sectionId: examSchedule.sectionId,
		id: examSchedule.id,
		class: examSchedule.class,
		section: examSchedule.section,
	})

	// Fetch students for this exam
	const {
		data: students = [],
		isLoading: studentsLoading,
		error: studentsError,
	} = useStudentsForExam(examSchedule.class?.id)

	console.log('ResultEntryManageDialog - Students data:', {
		students,
		studentsLength: students.length,
		studentsLoading,
		studentsError: studentsError?.message,
	})

	// Fetch existing results
	const { data: existingResults = [], isLoading: resultsLoading } = useQuery({
		queryKey: ['existing-results', examSchedule.id],
		queryFn: () => fetchExistingResults(examSchedule.id),
		enabled: !!examSchedule.id,
	})

	const handleSuccess = () => {
		toast.success('Results saved successfully!')
		onSuccess()
	}

	if (studentsLoading || resultsLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="flex items-center gap-2">
					<Loader2 className="h-5 w-5 animate-spin" />
					<span>Loading exam data...</span>
				</div>
			</div>
		)
	}

	if (studentsError) {
		return (
			<div className="p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Failed to load students for this exam. Please try again.
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	if (students.length === 0) {
		return (
			<div className="p-6">
				<Alert>
					<Users className="h-4 w-4" />
					<AlertDescription>
						No students found for this class/section. Please check the exam
						configuration.
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{examSchedule.exam?.title} - {examSchedule.subject?.name}
					</CardTitle>
					<CardDescription>
						Class: {examSchedule.class?.name}
						{examSchedule.section?.name &&
							` - Section: ${examSchedule.section.name}`}
						{' | '}
						Students: {students.length}
						{' | '}
						Components: {examSchedule.components?.length || 0}
					</CardDescription>
				</CardHeader>
			</Card>

			{/* Result Entry Form */}
			<ResultEntryForm
				examSchedule={examSchedule}
				students={students}
				existingResults={existingResults}
				onSuccess={handleSuccess}
			/>
		</div>
	)
}
