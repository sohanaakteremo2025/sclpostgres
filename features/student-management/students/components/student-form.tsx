'use client'
import {
	GenderSchema,
	ReligionSchema,
	Student,
	StudentStatusSchema,
} from '@/lib/zod'
import React from 'react'
import {
	FormInput,
	MultiStepFormProvider,
	FormStep,
	StepIndicator,
	MultiStepFormRoot,
	StepContent,
	FormDatePicker,
	FormSelect,
	FormTextarea,
	FormPhotoUpload,
	StepNavigation,
	FormFieldWatcher,
} from '@/components/school-form'
import {
	CreateStudentInput,
	CreateStudentInputSchema,
	UpdateStudentInput,
} from '@/lib/zod'
import { createStudent, updateStudent } from '../api/student.action'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import {
	useClassSectionCascade,
	useFeeStructures,
	useSessions,
} from '@/hooks/queries/all-quries'
import { useParams } from 'next/navigation'
import { StudentIdGenerator } from '@/utils/studentid-generator'

const studentRegistrationSteps: FormStep<
	CreateStudentInput | UpdateStudentInput
>[] = [
	{
		id: 'personal',
		title: 'Personal',
		fields: [
			'name',
			'roll',
			'email',
			'phone',
			'dateOfBirth',
			'gender',
			'religion',
			'address',
		],
	},

	{
		id: 'academic',
		title: 'Academic',
		fields: ['studentId', 'sessionId', 'sectionId', 'feeStructureId', 'status'],
	},

	{
		id: 'family',
		title: 'Family',
		fields: ['fatherName', 'motherName', 'guardianPhone'],
	},

	{
		id: 'additional',
		title: 'Additional',
		fields: ['photo', 'admissionDate'],
		optionalFields: ['photo'],
	},
]

export default function StudentForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: Student
}) {
	const {
		classes,
		sections,
		setSelectedClassId,
		isLoadingClasses,
		isLoadingSections,
	} = useClassSectionCascade()
	const { data: sessions, isLoading: isLoadingSessions } = useSessions()
	const { data: feeStructures, isLoading: isLoadingFeeStructures } =
		useFeeStructures()
	const { domain = 'no_domain' } = useParams()

	const isLoading =
		isLoadingClasses ||
		isLoadingSections ||
		isLoadingFeeStructures ||
		isLoadingSessions

	const handleSubmit = async (
		data: CreateStudentInput | UpdateStudentInput,
	) => {
		try {
			if (item) {
				await updateStudent(item.id, data as UpdateStudentInput)
			} else {
				await createStudent(data as CreateStudentInput)
			}
			onSuccess()
			return {
				success: true,
				message: 'Student created successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error ? error.message : 'Failed to create student',
			}
		}
	}
	return (
		<div className="">
			<MultiStepFormProvider
				persistenceKey="student-form"
				enablePersistence={true}
				schema={CreateStudentInputSchema}
				steps={studentRegistrationSteps}
				onSubmit={handleSubmit}
				defaultValues={item}
				isLoading={isLoading}
				loadingMessage="Loading student data..."
			>
				<div className="">
					<StepIndicator className="mb-0" clickable />

					<MultiStepFormRoot className="p-6 h-[calc(100vh-10rem)] overflow-y-auto">
						{/* Step 1: Personal Information */}
						<StepContent stepId="personal">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										name="name"
										label="Full Name"
										placeholder="Enter student's full name"
										required
									/>

									<FormInput
										name="roll"
										label="Roll Number"
										placeholder="Enter roll number"
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										name="email"
										label="Email Address"
										type="email"
										placeholder="student@example.com"
										required
									/>

									<FormInput
										name="phone"
										label="Phone Number"
										type="tel"
										placeholder="Enter phone number"
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormDatePicker
										name="dateOfBirth"
										label="Date of Birth"
										placeholder="Select date of birth"
										required
									/>

									<FormSelect
										name="gender"
										label="Gender"
										options={enumToOptions(GenderSchema.enum)}
										placeholder="Select gender"
										required
									/>

									<FormSelect
										name="religion"
										label="Religion"
										options={enumToOptions(ReligionSchema.enum)}
										placeholder="Select religion"
										required
									/>
								</div>
								<FormTextarea
									name="address"
									label="Full Address"
									placeholder="Enter complete address including city, state, and postal code"
									rows={4}
									required
								/>
							</div>
						</StepContent>

						{/* Step 2: Academic Details */}
						<StepContent stepId="academic">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormSelect
										name="classId"
										label="Class"
										isLoading={isLoadingClasses}
										options={classes}
										placeholder="Select class"
										required
									/>
									{/* Watch classId and update sections */}
									<FormFieldWatcher
										fieldName="classId"
										onChange={value => setSelectedClassId(value)}
									/>
									<FormSelect
										name="sectionId"
										label="Class Section"
										isLoading={isLoadingSections}
										options={sections}
										placeholder="Select class section"
										required
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										name="studentId"
										label="Student ID"
										placeholder="Generated based on class, section, and roll"
										required
									/>
									<FormFieldWatcher
										fieldName="classId"
										onChange={value => setSelectedClassId(value)}
									/>

									{/* New multi-field watcher for student ID generation */}
									<FormFieldWatcher
										fieldNames={['classId', 'sectionId', 'roll']}
										onChange={(values: any, setValue: any) => {
											const { classId, sectionId, roll } = values

											// Only generate if we have all required values
											if (
												classId &&
												sectionId &&
												roll &&
												domain !== 'no_domain'
											) {
												try {
													// Find the selected class and section names
													const selectedClass = classes?.find(
														c => c.value === classId,
													)
													const selectedSection = sections?.find(
														s => s.value === sectionId,
													)

													if (selectedClass && selectedSection) {
														const generatedId = StudentIdGenerator.generate({
															subdomain: domain as string,
															className: selectedClass.label,
															sectionName: selectedSection.label,
															roll: roll,
														})
														console.log(generatedId)
														// Set the generated ID in the form
														setValue('studentId', generatedId)
													}
												} catch (error) {
													console.error('Failed to generate student ID:', error)
													// Optionally clear the field if generation fails
													setValue('studentId', '')
												}
											} else if (!classId || !sectionId || !roll) {
												// Clear student ID if any required field is missing
												setValue('studentId', '')
											}
										}}
									/>

									<FormSelect
										name="status"
										label="Student Status"
										options={enumToOptions(StudentStatusSchema.enum)}
										placeholder="Select status"
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormSelect
										name="sessionId"
										label="Academic Session"
										options={sessions || []}
										isLoading={isLoadingSessions}
										placeholder="Select academic session"
										required
									/>

									<FormSelect
										name="feeStructureId"
										label="Fee Structure"
										options={feeStructures || []}
										isLoading={isLoadingFeeStructures}
										placeholder="Select class"
										required
									/>
								</div>
							</div>
						</StepContent>

						{/* Step 2: Family Information */}
						<StepContent stepId="family">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										name="fatherName"
										label="Father's Name"
										placeholder="Enter father's full name"
										required
									/>

									<FormInput
										name="motherName"
										label="Mother's Name"
										placeholder="Enter mother's full name"
										required
									/>
								</div>

								<FormInput
									name="guardianPhone"
									label="Guardian Phone Number"
									type="tel"
									placeholder="Enter guardian's phone number"
									description="Primary contact number for emergencies"
									required
								/>
							</div>
						</StepContent>

						{/* Step 4: Additional Information */}
						<StepContent stepId="additional">
							<div className="space-y-6">
								<FormPhotoUpload
									name="photo"
									label="Student Photo"
									maxSize={1024}
									uploadUrl={process.env.NEXT_PUBLIC_UPLOAD_URL || ''}
									uploadPath={domain + '/student'}
								/>
								<FormDatePicker
									name="admissionDate"
									label="Admission Date"
									placeholder="Select admission date (optional)"
								/>
							</div>
						</StepContent>

						<StepNavigation
							submitLabel={item ? 'Update Student' : 'Register Student'}
							submitLoadingLabel={item ? 'Updating...' : 'Registering...'}
							className="border-t pt-6 mt-8"
						/>
					</MultiStepFormRoot>
				</div>
			</MultiStepFormProvider>
		</div>
	)
}
