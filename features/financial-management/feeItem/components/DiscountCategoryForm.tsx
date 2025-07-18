import React from 'react'
import {
	FormProvider,
	FormInput,
	FormRoot,
	FormSubmit,
	FormTextarea,
} from '@/components/school-form'
import {
	CreateDiscountCategoryInput,
	CreateDiscountCategoryInputSchema,
} from '@/lib/zod'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { queryClient } from '@/lib/query-client'
import { createDiscountCategory } from '../../dueAdjustment/api/dueAdjustment.action'

export default function DiscountCategoryForm({
	onSuccess,
}: {
	onSuccess: () => void
}) {
	const onSubmitHandler = async (data: CreateDiscountCategoryInput) => {
		try {
			await createDiscountCategory(data)
			queryClient.invalidateQueries({
				queryKey: ['discount-categories'],
			})
			onSuccess()
			return {
				success: true,
				message: 'Discount category created successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create discount category',
			}
		}
	}
	return (
		<FormProvider
			schema={CreateDiscountCategoryInputSchema}
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<FormInput
					name="title"
					placeholder="eg: scholarship, sibling discount"
					label="Discount Category"
					required
				/>
				<FormTextarea
					name="note"
					placeholder="eg: two children discount, sibling discount"
					label="Note"
					required
				/>
				<FormSubmit />
			</FormRoot>
		</FormProvider>
	)
}
