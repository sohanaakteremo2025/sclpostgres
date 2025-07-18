import { z } from 'zod'
import {
	FormProvider,
	useFormContext,
	FormRoot,
	FormSelect,
	FormDatePicker,
	FormTimeInput,
	FormArray,
	FormInput,
	FormSubmit,
} from '@/components/school-form'
import {
	useClassSectionSubjectCascade,
	useTeachers,
	useExams,
	useClassSectionCascade,
	useSubjects,
	useClassSubjects,
	useSectionSubjects,
} from '@/hooks/queries/all-quries'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { useEffect, useMemo, useCallback } from 'react'
import {
	BulkExamScheduleFormData,
	bulkExamScheduleSchema,
	ExamComponent,
	ExamSchedule,
} from '../types'
import {
	createBulkExamSchedule,
	updateBulkExamSchedule,
} from '../api/examSchedule.action'

// Optimized Form Content Component
function BulkExamScheduleFormContent() {
	const {
		classes,
		sections,
		setSelectedClassId,
		setSelectedSectionId,
		isLoadingSections,
	} = useClassSectionCascade()

	const { data: teachers } = useTeachers()
	const { data: exams } = useExams()
	const { form } = useFormContext()

	const classId = form.watch('classId')
	const sectionId = form.watch('sectionId')

	const { data: classSubjects } = useClassSubjects(classId)
	const { data: sectionSubjects } = useSectionSubjects(sectionId)

	// Memoize subjects to prevent unnecessary re-renders
	const subjects = useMemo(() => {
		return classSubjects || sectionSubjects || []
	}, [classSubjects, sectionSubjects])

	// Memoize default schedule item creator
	const createDefaultScheduleItem = useCallback(
		(): ExamSchedule => ({
			subjectId: '',
			date: new Date(),
			startTime: 900,
			endTime: 1100,
			room: '',
			invigilatorIds: [],
			components: [
				{
					name: 'Theory',
					maxMarks: 100,
					order: 1,
				},
			],
		}),
		[],
	)

	// Memoize default component item creator
	const createDefaultComponentItem = useCallback(
		(): ExamComponent => ({
			name: '',
			maxMarks: 100,
			order: 1,
		}),
		[],
	)

	// Optimized useEffect with proper dependencies
	useEffect(() => {
		if (subjects.length > 0) {
			const currentSchedules = form.getValues('schedules') || []

			// Only update if no schedules exist or if subjects have changed significantly
			if (currentSchedules.length === 0) {
				const defaultDate = new Date()
				const newSchedules: ExamSchedule[] = subjects.map(subject => ({
					subjectId: subject.value,
					date: defaultDate,
					startTime: 900,
					endTime: 1100,
					room: '',
					invigilatorIds: [],
					components: [
						{
							name: 'Theory',
							maxMarks: 100,
							order: 1,
						},
					],
				}))
				form.setValue('schedules', newSchedules)
			}
		}
	}, [subjects, form])

	// Memoized handlers
	const handleClassChange = useCallback(
		(value: string) => {
			setSelectedClassId(value)
			form.setValue('sectionId', '')
			form.setValue('schedules', []) // Reset schedules when class changes
		},
		[setSelectedClassId, form],
	)

	const handleSectionChange = useCallback(
		(value: string) => {
			setSelectedSectionId(value)
			form.setValue('schedules', []) // Reset schedules when section changes
		},
		[setSelectedSectionId, form],
	)

	return (
		<FormRoot>
			<div className="space-y-6">
				{/* Exam Selection Section */}
				<div className="bg-white p-4 rounded-lg border">
					<h3 className="text-lg font-semibold mb-4">Exam Details</h3>
					<FormSelect
						name="examId"
						label="Select Exam"
						options={exams || []}
						required
						placeholder="Choose exam..."
					/>
				</div>

				{/* Class and Section Selection */}
				<div className="bg-white p-4 rounded-lg border">
					<h3 className="text-lg font-semibold mb-4">Class & Section</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormSelect
							name="classId"
							label="Class"
							options={classes}
							required
							onChange={handleClassChange}
						/>
						<FormSelect
							name="sectionId"
							label="Section"
							options={sections}
							isLoading={isLoadingSections}
							placeholder="All sections"
							onChange={handleSectionChange}
						/>
					</div>
				</div>

				{/* Schedules Section */}
				<div className="bg-white p-4 rounded-lg border">
					<h3 className="text-lg font-semibold mb-4">Exam Schedules</h3>
					<FormArray
						name="schedules"
						isMultiStepForm={false}
						addButtonLabel="Add Subject Schedule"
						defaultItem={createDefaultScheduleItem}
					>
						{(field, index) => (
							<div className="p-6 border rounded-lg space-y-4 bg-gray-50">
								<div className="flex items-center justify-between">
									<h4 className="font-medium text-gray-900">
										Schedule {index + 1}
									</h4>
								</div>

								{/* Subject Selection */}
								<div className="grid grid-cols-1">
									<FormSelect
										name={`schedules.${index}.subjectId`}
										label="Subject"
										options={subjects}
										required
										placeholder="Select subject..."
									/>
								</div>

								{/* Date and Time Settings */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormDatePicker
										name={`schedules.${index}.date`}
										label="Date"
										required
									/>
									<FormTimeInput
										name={`schedules.${index}.startTime`}
										label="Start Time"
										format="12"
										returnAsNumber
										required
									/>
									<FormTimeInput
										name={`schedules.${index}.endTime`}
										label="End Time"
										format="12"
										returnAsNumber
										required
									/>
								</div>

								{/* Room and Invigilators */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										name={`schedules.${index}.room`}
										label="Room"
										placeholder="Enter room number..."
									/>
									<FormSelect
										name={`schedules.${index}.invigilatorIds`}
										label="Invigilators"
										options={teachers || []}
										multiple
										placeholder="Select invigilators..."
									/>
								</div>

								{/* Components Section */}
								<div className="space-y-4">
									<h5 className="font-medium text-gray-800">Exam Components</h5>
									<FormArray
										name={`schedules.${index}.components`}
										isMultiStepForm={false}
										addButtonLabel="Add Component (Theory/Practical)"
										defaultItem={createDefaultComponentItem}
									>
										{(componentField, componentIndex) => (
											<div className="p-4 bg-white rounded-md border">
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													<FormInput
														name={`schedules.${index}.components.${componentIndex}.name`}
														label="Component Name"
														placeholder="e.g., Theory, Practical"
														required
													/>
													<FormInput
														name={`schedules.${index}.components.${componentIndex}.maxMarks`}
														label="Max Marks"
														type="number"
														required
													/>
													<FormInput
														name={`schedules.${index}.components.${componentIndex}.order`}
														label="Order"
														type="number"
														value={componentIndex + 1}
													/>
												</div>
											</div>
										)}
									</FormArray>
								</div>
							</div>
						)}
					</FormArray>
				</div>

				{/* Submit Button */}
				<div className="pt-6 border-t">
					<FormSubmit className="w-full md:w-auto">
						Create All Schedules
					</FormSubmit>
				</div>
			</div>
		</FormRoot>
	)
}

export default function BulkExamScheduleForm({
	item,
	onSuccess,
}: {
	item?: any
	onSuccess: () => void
}) {
	const onSubmitHandler = async (data: any) => {
		try {
			if (item) {
				await updateBulkExamSchedule(data)
				onSuccess()
				return {
					success: true,
					message: 'Exam schedules updated successfully!',
				}
			}
			await createBulkExamSchedule(data)

			onSuccess()
			return { success: true, message: 'Exam schedules created successfully!' }
		} catch (error) {
			return {
				success: false,
				message: cleanErrorMessage(error),
			}
		}
	}

	return (
		<FormProvider
			schema={bulkExamScheduleSchema as any}
			onSubmit={onSubmitHandler}
			defaultValues={{
				examId: item?.examId || '',
				classId: item?.classId || '',
				sectionId: item?.sectionId || '',
				schedules: [
					{
						...item,
						invigilatorIds:
							item?.invigilators?.map((invigilator: any) => invigilator.id) ||
							[],
					},
				],
			}}
		>
			<BulkExamScheduleFormContent />
		</FormProvider>
	)
}
