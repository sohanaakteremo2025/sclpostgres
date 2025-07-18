import React from 'react'
import {
	FormProvider,
	FormInput,
	FormRoot,
	FormSubmit,
} from '@/components/school-form'
import {
	CreateTransactionCategoryInput,
	CreateTransactionCategoryInputSchema,
} from '@/lib/zod'
import { createTransactionCategory } from '../api/tenantAccount.action'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { queryClient } from '@/lib/query-client'

export default function TransactionCategoryForm({
	onSuccess,
}: {
	onSuccess: () => void
}) {
	const onSubmitHandler = async (data: CreateTransactionCategoryInput) => {
		try {
			await createTransactionCategory(data)
			queryClient.invalidateQueries({
				queryKey: ['tenant-transaction-categories'],
			})
			onSuccess()
			return {
				success: true,
				message: 'Transaction category created successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create transaction category',
			}
		}
	}
	return (
		<FormProvider
			schema={CreateTransactionCategoryInputSchema}
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<FormInput
					name="title"
					placeholder="eg: Fess, Income"
					label="Category name"
					required
				/>
				<FormSubmit />
			</FormRoot>
		</FormProvider>
	)
}
