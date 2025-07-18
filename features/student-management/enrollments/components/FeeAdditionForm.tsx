// components/FeeAdditionForm.tsx
'use client'
import React, { useState, useMemo } from 'react'
import {
	FormProvider,
	FormRoot,
	FormSelect,
	FormInput,
	FormTextarea,
	FormSubmit,
	useFormContext,
} from '@/components/school-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Users, User, AlertCircle, CheckCircle } from 'lucide-react'
import { z } from 'zod'
import { currencySimbols } from '@/constants/constants'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { FeeCategorySchema } from '@/lib/zod'
import { addFeeToTarget } from '../api/studentDue.action'
// import { addFeeToTarget } from '@/api/feeAddition.action'

// Define the form schema
const FeeAdditionSchema = z.object({
	// Target selection
	targetType: z.enum(['CLASS', 'SECTION', 'STUDENT']),
	classId: z.string().min(1, 'Class is required'),
	sectionId: z.string().optional(),
	studentId: z.string().optional(),

	// Fee details
	title: z.string().min(1, 'Fee title is required'),
	originalAmount: z.number().min(1, 'Amount must be positive'),
	description: z.string().optional(),
	category: FeeCategorySchema,

	// Due period
	month: z
		.number()
		.min(1)
		.max(12)
		.default(new Date().getMonth() + 1),
	year: z.number().default(new Date().getFullYear()),
})

type FeeAdditionFormData = z.infer<typeof FeeAdditionSchema>

// Target type options
const targetTypeOptions = [
	{ value: 'CLASS', label: 'Entire Class' },
	{ value: 'SECTION', label: 'Specific Section' },
	{ value: 'STUDENT', label: 'Individual Student' },
]

// Month options
const monthOptions = [
	{ value: 1, label: 'January' },
	{ value: 2, label: 'February' },
	{ value: 3, label: 'March' },
	{ value: 4, label: 'April' },
	{ value: 5, label: 'May' },
	{ value: 6, label: 'June' },
	{ value: 7, label: 'July' },
	{ value: 8, label: 'August' },
	{ value: 9, label: 'September' },
	{ value: 10, label: 'October' },
	{ value: 11, label: 'November' },
	{ value: 12, label: 'December' },
]

// Year options (current year and next few years)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
	value: currentYear + i,
	label: (currentYear + i).toString(),
}))

interface FeeAdditionFormProps {
	classes: Array<{ value: string; label: string }>
	sections: Array<{ value: string; label: string }>
	students: Array<{ value: string; label: string }>
	selectedClassId: string
	selectedSectionId: string
	onClassChange: (classId: string) => void
	onSectionChange: (sectionId: string) => void
	onSuccess: () => void
	isLoadingClasses: boolean
	isLoadingSections: boolean
	isLoadingStudents: boolean
}

// Form watcher component to handle conditional fields
function FormWatcher({ selectedTargetType }: { selectedTargetType: string }) {
	return (
		<div className="space-y-4">
			{/* Show appropriate fields based on target type */}
			{selectedTargetType && (
				<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
					<div className="flex items-center gap-2 mb-3">
						{selectedTargetType === 'CLASS' && (
							<Users className="h-4 w-4 text-blue-600" />
						)}
						{selectedTargetType === 'SECTION' && (
							<Users className="h-4 w-4 text-blue-600" />
						)}
						{selectedTargetType === 'STUDENT' && (
							<User className="h-4 w-4 text-blue-600" />
						)}
						<span className="text-sm font-medium text-blue-900">
							{selectedTargetType === 'CLASS' && 'Adding fee to entire class'}
							{selectedTargetType === 'SECTION' &&
								'Adding fee to specific section'}
							{selectedTargetType === 'STUDENT' &&
								'Adding fee to individual student'}
						</span>
					</div>

					<div className="text-xs text-blue-700">
						{selectedTargetType === 'CLASS' &&
							'This fee will be added to all students in the selected class'}
						{selectedTargetType === 'SECTION' &&
							'This fee will be added to all students in the selected section'}
						{selectedTargetType === 'STUDENT' &&
							'This fee will be added to the selected student only'}
					</div>
				</div>
			)}
		</div>
	)
}

export default function FeeAdditionForm({
	classes,
	sections,
	students,
	selectedClassId,
	selectedSectionId,
	onClassChange,
	onSectionChange,
	onSuccess,
	isLoadingClasses,
	isLoadingSections,
	isLoadingStudents,
}: FeeAdditionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
	const [selectedTargetType, setSelectedTargetType] = useState<
		'CLASS' | 'SECTION' | 'STUDENT'
	>('CLASS')
	const [selectedStudentId, setSelectedStudentId] = useState<string>('')
	console.log(selectedTargetType)
	// Handle target type change
	const handleTargetTypeChange = (targetType: string) => {
		setSelectedTargetType(targetType as 'CLASS' | 'SECTION' | 'STUDENT')
		// Reset student selection when target type changes
		setSelectedStudentId('')
	}

	// Handle student selection
	const handleStudentChange = (studentId: string) => {
		setSelectedStudentId(studentId)
	}

	const handleSubmit = async (data: FeeAdditionFormData) => {
		setIsSubmitting(true)
		setSubmitError(null)
		setSubmitSuccess(null)

		try {
			// Prepare the payload for the API
			const payload = {
				targetType: selectedTargetType,
				classId: data.classId,
				sectionId:
					selectedTargetType === 'SECTION' || selectedTargetType === 'STUDENT'
						? data.sectionId
						: undefined,
				studentId:
					selectedTargetType === 'STUDENT' ? selectedStudentId : undefined,
				feeDetails: {
					title: data.title,
					originalAmount: data.originalAmount,
					description: data.description || '',
					category: data.category,
					month: data.month,
					year: data.year,
				},
			}

			console.log(payload)

			await addFeeToTarget(payload)

			setSubmitSuccess('Fee added successfully')
			onSuccess()
			return {
				success: true,
				message: 'Fee added successfully',
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to add fee'
			setSubmitError(errorMessage)

			return {
				success: false,
				message: errorMessage,
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card className="shadow-sm">
			<CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
				<CardTitle className="flex items-center gap-3 text-xl text-green-900">
					<Plus className="h-6 w-6" />
					Add New Fee
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<FormProvider
					schema={FeeAdditionSchema as any}
					defaultValues={{
						targetType: 'CLASS',
						classId: selectedClassId || '',
						sectionId: selectedSectionId || '',
						studentId: selectedStudentId || '',
						title: '',
						description: '',
						category: FeeCategorySchema.enum.OTHER,
						month: new Date().getMonth() + 1,
						year: new Date().getFullYear(),
					}}
					onSubmit={handleSubmit}
				>
					<FormRoot className="space-y-6">
						{/* Success Alert */}
						{submitSuccess && (
							<Alert className="bg-green-50 border-green-200">
								<CheckCircle className="h-4 w-4 text-green-600" />
								<AlertDescription className="text-green-800">
									{submitSuccess}
								</AlertDescription>
							</Alert>
						)}

						{/* Error Alert */}
						{submitError && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{submitError}</AlertDescription>
							</Alert>
						)}

						{/* Target Type Selection */}
						<FormSelect
							name="targetType"
							label="Add Fee To"
							placeholder="Select target type"
							options={targetTypeOptions}
							value={selectedTargetType}
							onChange={handleTargetTypeChange}
							required
						/>

						{/* Form Watcher for conditional fields */}
						<FormWatcher selectedTargetType={selectedTargetType || 'CLASS'} />

						{/* Class Selection */}
						<FormSelect
							name="classId"
							label="Class"
							placeholder="Select Class"
							isLoading={isLoadingClasses}
							options={classes}
							onChange={onClassChange}
							required
						/>

						{/* Section Selection (conditional) */}
						{(selectedTargetType === 'SECTION' ||
							selectedTargetType === 'STUDENT') && (
							<FormSelect
								name="sectionId"
								label="Section"
								placeholder="Select Section"
								isLoading={isLoadingSections}
								disabled={!selectedClassId}
								options={sections}
								onChange={onSectionChange}
								required
							/>
						)}

						{/* Student Selection (conditional) */}
						{selectedTargetType === 'STUDENT' && (
							<FormSelect
								name="studentId"
								label="Student"
								placeholder="Select Student"
								isLoading={isLoadingStudents}
								disabled={!selectedSectionId}
								options={students}
								onChange={handleStudentChange}
								required
							/>
						)}

						{/* Fee Details Section */}
						<div className="space-y-4 pt-4 border-t">
							<h3 className="text-lg font-semibold text-gray-900">
								Fee Details
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormInput
									name="title"
									label="Fee Title"
									placeholder="e.g., Monthly Tuition Fee"
									required
								/>

								<FormInput
									name="originalAmount"
									label="Amount"
									type="decimal"
									currencySymbol={currencySimbols.BDT}
									placeholder="0.00"
									required
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormSelect
									name="category"
									label="Fee Category"
									placeholder="Select category"
									options={enumToOptions(FeeCategorySchema.enum)}
									required
								/>

								<div className="grid grid-cols-2 gap-2">
									<FormSelect
										name="month"
										label="Month"
										placeholder="Month"
										options={monthOptions as any}
										returnAsNumber={true}
										required
									/>
									<FormSelect
										name="year"
										label="Year"
										placeholder="Year"
										options={yearOptions as any}
										returnAsNumber={true}
										required
									/>
								</div>
							</div>

							<FormTextarea
								name="description"
								label="Description (Optional)"
								placeholder="Enter additional details about this fee..."
								rows={3}
							/>
						</div>

						{/* Submit Button */}
						<div className="pt-4 border-t">
							<FormSubmit
								className="w-full bg-green-600 hover:bg-green-700"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>Processing...</>
								) : (
									<>
										<Plus className="h-4 w-4 mr-2" />
										Add Fee
									</>
								)}
							</FormSubmit>
						</div>
					</FormRoot>
				</FormProvider>
			</CardContent>
		</Card>
	)
}
