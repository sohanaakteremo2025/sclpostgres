'use client'
import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormSelect,
	FormFieldWatcher,
} from '@/components/school-form'
import {
	Section,
	UpdateSubjectInput,
	CreateSubjectInput,
	CreateSubjectInputSchema,
	SubjectTypeSchema,
} from '@/lib/zod'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { useClassSectionCascade } from '@/hooks/queries/all-quries'
import { createSubject, updateSubject } from '../api/subject.action'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'

interface SubjectFormProps {
	onSuccess: () => void
	item?: Section
}

export default function SubjectForm({ onSuccess, item }: SubjectFormProps) {
	const {
		classes,
		sections,
		setSelectedClassId,
		isLoadingClasses,
		isLoadingSections,
	} = useClassSectionCascade()

	const onSubmitHandler = async (data: CreateSubjectInput) => {
		try {
			if (item) {
				await updateSubject(item.id, data as UpdateSubjectInput)
				onSuccess()
				return {
					success: true,
					message: 'Subject updated successfully!',
				}
			} else {
				await createSubject(data as CreateSubjectInput)
				onSuccess()
				return {
					success: true,
					message: 'Subject created successfully!',
				}
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create subject',
			}
		}
	}

	return (
		<FormProvider
			schema={CreateSubjectInputSchema}
			defaultValues={item} // Now classes are available
			onSubmit={onSubmitHandler}
			isLoading={isLoadingClasses || isLoadingSections}
			loadingMessage="Loading classes..."
		>
			<FormRoot>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput
						name="name"
						label="Subject Name"
						placeholder="Enter subject name"
						required
					/>
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
					{/* <FormFieldWatcher
						fieldName="classId"
						onChange={value => setSelectedClassId(value)}
					/> */}
					<FormSelect
						name="sectionId"
						label="Section"
						options={sections}
						isLoading={isLoadingSections}
						loadingText="Loading sections..."
						placeholder="Select a section"
					/>
					<FormSelect
						name="type"
						label="Type"
						options={enumToOptions(SubjectTypeSchema.enum)}
						placeholder="Select a type"
					/>
					<FormInput name="code" label="Code" placeholder="Enter a code" />
				</div>
				<FormSubmit>{item ? 'Update' : 'Create'}</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
