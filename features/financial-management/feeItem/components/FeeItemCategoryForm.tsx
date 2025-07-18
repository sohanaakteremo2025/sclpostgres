import React from 'react'
import {
	FormProvider,
	FormInput,
	FormRoot,
	FormSubmit,
	FormTextarea,
} from '@/components/school-form'
import {
	CreateFeeItemCategoryInput,
	CreateFeeItemCategoryInputSchema,
} from '@/lib/zod'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { queryClient } from '@/lib/query-client'
import { createFeeItemCategory } from '../../dueItem/api/duitem.action'

export default function FeeItemCategoryForm({
	onSuccess,
}: {
	onSuccess: () => void
}) {
	const onSubmitHandler = async (data: CreateFeeItemCategoryInput) => {
		try {
			await createFeeItemCategory(data)
			queryClient.invalidateQueries({
				queryKey: ['fee-item-categories'],
			})
			onSuccess()
			return {
				success: true,
				message: 'Fee item category created successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create fee item category',
			}
		}
	}
	return (
		<FormProvider
			schema={CreateFeeItemCategoryInputSchema}
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<FormInput
					name="title"
					placeholder="eg: exam fees, tuition fees"
					label="Category name"
					required
				/>
				<FormTextarea
					name="note"
					placeholder="eg: fees for exam or monthly fees"
					label="Note"
					required
				/>
				<FormSubmit />
			</FormRoot>
		</FormProvider>
	)
}
