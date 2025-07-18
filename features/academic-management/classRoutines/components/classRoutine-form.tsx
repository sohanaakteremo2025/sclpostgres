'use client'
import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormSelect,
} from '@/components/school-form'
import {
	Section,
	CreateClassRoutineInput,
	UpdateClassRoutineInput,
	CreateClassRoutinePayload,
	CreateClassRoutinePayloadSchema,
	WeekDaySchema,
} from '@/lib/zod'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { useClassSectionCascade } from '@/hooks/queries/all-quries'
import {
	createClassRoutine,
	updateClassRoutine,
} from '../api/classRoutine.action'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { useTenantEmployees } from '@/hooks/queries/all-quries'
import { ClassRoutine } from '@/lib/zod'

interface ClassRoutineFormProps {
	onSuccess: () => void
	item?: ClassRoutine
}

export default function ClassRoutineForm({
	onSuccess,
	item,
}: ClassRoutineFormProps) {
	const {
		classes,
		sections,
		setSelectedClassId,
		isLoadingClasses,
		isLoadingSections,
	} = useClassSectionCascade()

	const { data: employees, isLoading: isLoadingEmployees } =
		useTenantEmployees()
	const onSubmitHandler = async (data: CreateClassRoutineInput) => {
		try {
			if (item) {
				await updateClassRoutine(item.id, data as UpdateClassRoutineInput)
				onSuccess()
				return {
					success: true,
					message: 'Class Routine updated successfully!',
				}
			} else {
				await createClassRoutine(data as CreateClassRoutinePayload)
				onSuccess()
				return {
					success: true,
					message: 'Class Routine created successfully!',
				}
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create class routine',
			}
		}
	}

	return (
		<FormProvider
			schema={CreateClassRoutinePayloadSchema}
			defaultValues={item} // Now classes are available
			onSubmit={onSubmitHandler}
			isLoading={isLoadingClasses || isLoadingSections}
			loadingMessage="Loading classes..."
		>
			<FormRoot>
				<FormSelect
					name="classId"
					onChange={value => setSelectedClassId(value)}
					label="Class"
					required
					options={classes}
					isLoading={isLoadingClasses}
					loadingText="Loading classes..."
					placeholder="Select a class"
				/>
				<FormSelect
					name="sectionId"
					label="Section"
					options={sections}
					isLoading={isLoadingSections}
					loadingText="Loading sections..."
					placeholder="Select a section"
				/>
				<FormSelect
					name="dayOfWeek"
					label="Day of Week"
					options={enumToOptions(WeekDaySchema.enum)}
					placeholder="Select a day of week"
				/>
				<FormInput
					type="number"
					name="startTime"
					label="Start Time"
					placeholder="Enter start time"
					required
				/>
				<FormInput
					type="number"
					name="endTime"
					label="End Time"
					placeholder="Enter end time"
					required
				/>
				<FormInput name="room" label="Room" placeholder="Enter room" required />
				<FormSelect
					name="teacherId"
					label="Teacher"
					options={employees || []}
					isLoading={isLoadingEmployees}
					loadingText="Loading teachers..."
					placeholder="Select a teacher"
				/>

				<FormSubmit>{item ? 'Update' : 'Create'}</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
