'use client'
import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormFieldWatcher,
} from '@/components/school-form'
import { CreateExamTypeInput, CreateExamTypeInputSchema } from '@/lib/zod'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { createExamType } from '../api/exam-types'
import { invalidateQueries } from '@/lib/query-client'

export default function ExamTypeForm({ onSuccess }: { onSuccess: () => void }) {
	const [convertedWeight, setConvertedWeight] = React.useState(0)

	const handleWeightChange = (value: string) => {
		const numValue = parseFloat(value) || 0
		const weight = numValue / 100
		setConvertedWeight(weight)
	}

	const onSubmitHandler = async (data: CreateExamTypeInput) => {
		try {
			// Use the converted weight instead of the raw input
			const submitData = {
				...data,
				weight: convertedWeight,
			}

			await createExamType(submitData)
			invalidateQueries(['exam-types'])
			onSuccess()
			return {
				success: true,
				message: 'Exam Type created successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create exam type',
			}
		}
	}

	return (
		<FormProvider schema={CreateExamTypeInputSchema} onSubmit={onSubmitHandler}>
			<FormRoot className="space-y-4">
				<FormInput
					name="name"
					label="Exam Type Name"
					placeholder="e.g., Midterm, Final, Quiz"
					required
				/>
				<div className="space-y-2">
					<FormInput
						placeholder="e.g. 100, 75, 25"
						name="weight"
						label="Total Marks"
						type="number"
						required
					/>
					<FormFieldWatcher
						isMultiStepForm={false}
						fieldName="weight"
						onChange={value => handleWeightChange(value)}
					/>
					<p className="text-sm text-gray-600">
						Will be converted to weight: {convertedWeight.toFixed(2)}
					</p>
				</div>
				<FormSubmit className="w-full">Create</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
