'use client'
// components/ExamCreationForm.tsx
import React, { useState } from 'react'
import {
	FormProvider,
	FormRoot,
	FormInput,
	FormSelect,
	FormSubmit,
	FormDatePicker,
} from '@/components/school-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import DialogWrapper from '@/components/Dialog-Wrapper'
import { CreateExamInput, CreateExamInputSchema } from '@/lib/zod'
import { useExamTypes, useSessions } from '@/hooks/queries/all-quries'
import { createExam, updateExam } from '../api/exam'
import ExamTypeForm from '../../exam-types/components/exam-types-form'

// Mock data props (replace with your actual data fetching)
interface ExamCreationFormProps {
	item?: any
	onSuccess: () => void
}

export const ExamForm: React.FC<ExamCreationFormProps> = ({
	item,
	onSuccess,
}) => {
	const { data: seesions, isLoading: seesionsLoading } = useSessions()
	const { data: examTypes, isLoading: examTypesLoading } = useExamTypes()
	const onSubmitHandler = async (data: any) => {
		try {
			if (item) {
				await updateExam(item.id, data)
				onSuccess()
				return {
					success: true,
					message: 'Exam updated successfully!',
				}
			} else {
				await createExam(data)
				onSuccess()
				return {
					success: true,
					message: 'Exam created successfully!',
				}
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to create exam'

			return {
				success: false,
				message: errorMessage,
			}
		}
	}

	return (
		<FormProvider
			schema={CreateExamInputSchema}
			defaultValues={item}
			onSubmit={onSubmitHandler}
			isLoading={seesionsLoading || examTypesLoading}
		>
			<FormRoot>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput
						name="title"
						label="Exam Title"
						placeholder="e.g., First Term Examination 2024"
						required
					/>
					<div className="flex items-end gap-2">
						<div className="w-full">
							<FormSelect
								name="examTypeId"
								label="Exam Type"
								options={examTypes || []}
								required
							/>
						</div>
						<DialogWrapper
							customTrigger={
								<Button variant="outline" className="w-fit">
									<Plus />
								</Button>
							}
							title=""
						>
							{({ onSuccess }) => <ExamTypeForm onSuccess={onSuccess} />}
						</DialogWrapper>
					</div>
					<FormSelect
						name="sessionId"
						label="Academic Session"
						options={seesions || []}
						required
					/>
					<FormDatePicker name="startDate" label="Start Date" required />
					<FormDatePicker name="endDate" label="End Date" required />
				</div>
				{/* Submit Button */}
				<div className="flex justify-center">
					<FormSubmit>Submit</FormSubmit>
				</div>
			</FormRoot>
		</FormProvider>
	)
}
