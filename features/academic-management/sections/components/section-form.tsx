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
	CreateSectionInput,
	CreateSectionInputSchema,
	UpdateSectionInput,
} from '@/lib/zod'
import { createSection, updateSection } from '../api/section.action'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { useClasses } from '@/hooks/queries/all-quries'

interface SectionFormProps {
	onSuccess: () => void
	item?: Section
}

export default function SectionForm({ onSuccess, item }: SectionFormProps) {
	const { data: classes = [], isLoading } = useClasses()

	const onSubmitHandler = async (data: CreateSectionInput) => {
		try {
			if (item) {
				await updateSection(item.id, data as UpdateSectionInput)
				onSuccess()
				return {
					success: true,
					message: 'Section updated successfully!',
				}
			} else {
				await createSection(data as CreateSectionInput)
				onSuccess()
				return {
					success: true,
					message: 'Section created successfully!',
				}
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create section',
			}
		}
	}

	return (
		<FormProvider
			schema={CreateSectionInputSchema}
			defaultValues={item} // Now classes are available
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<FormInput name="name" label="Section Name" required />
				<FormSelect
					name="classId"
					label="Class"
					required
					options={classes}
					isLoading={isLoading}
					loadingText="Loading classes..."
				/>
				<FormSubmit>{item ? 'Update' : 'Create'}</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
