'use client'
import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormSelect,
	FormTextarea,
} from '@/components/school-form'
import {
	UpdateTenantTransactionInput,
	CreateTenantTransactionInput,
	CreateTenantTransactionInputSchema,
	TransactionTypeSchema,
} from '@/lib/zod'
import { createTransaction, updateTransaction } from '../api/transaction.action'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import {
	useTenantAccounts,
	useTenantTransactionCategories,
} from '@/hooks/queries/all-quries'
import { TenantTransaction } from '@/lib/zod'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { currencySimbols } from '@/constants/constants'
import DialogWrapper from '@/components/Dialog-Wrapper'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import TransactionCategoryForm from '../../transactionCategory/components/TransactionCategoryForm'
import { queryClient } from '@/lib/query-client'

interface SectionFormProps {
	onSuccess: () => void
	item?: TenantTransaction
}

export default function TenantTransactionForm({
	onSuccess,
	item,
}: SectionFormProps) {
	const { data: categories = [], isLoading: categoriesLoading } =
		useTenantTransactionCategories()
	const { data: accounts = [], isLoading: accountsLoading } =
		useTenantAccounts()

	const onSubmitHandler = async (data: CreateTenantTransactionInput) => {
		try {
			if (item) {
				await updateTransaction(item.id, data as UpdateTenantTransactionInput)
				onSuccess()
				return {
					success: true,
					message: 'Transaction updated successfully!',
				}
			} else {
				await createTransaction(data as CreateTenantTransactionInput)
				onSuccess()
				return {
					success: true,
					message: 'Transaction created successfully!',
				}
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create transaction',
			}
		}
	}

	return (
		<FormProvider
			schema={CreateTenantTransactionInputSchema as any}
			defaultValues={item}
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<FormInput
					name="label"
					placeholder="eg: bonus salary"
					label="Label"
					required
				/>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormSelect
						name="type"
						label="Type"
						required
						placeholder="Select Type"
						options={enumToOptions([
							TransactionTypeSchema.enum.INCOME,
							TransactionTypeSchema.enum.EXPENSE,
						])}
					/>
					<FormSelect
						name="accountId"
						label="Account"
						required
						options={accounts}
						isLoading={accountsLoading}
						placeholder="Select Account"
						loadingText="Loading accounts..."
					/>
				</div>
				<div className="flex gap-2 items-end">
					<div className="w-full">
						<FormSelect
							name="categoryId"
							label="Category"
							required
							options={categories}
							isLoading={categoriesLoading}
							placeholder="Select Category"
							loadingText="Loading categories..."
						/>
					</div>
					<DialogWrapper
						customTrigger={
							<Button variant="outline" className="w-fit">
								<Plus />
							</Button>
						}
						title=""
					>
						{({ onSuccess }) => (
							<TransactionCategoryForm onSuccess={onSuccess} />
						)}
					</DialogWrapper>
				</div>

				<div className="space-y-4">
					<FormInput
						type="decimal"
						currencySymbol={currencySimbols.BDT}
						name="amount"
						label="Amount"
						required
					/>
					<FormTextarea
						name="note"
						label="Note"
						placeholder="eg: bonus salary given to Mr. X"
					/>
				</div>
				<FormSubmit>{item ? 'Update' : 'Create'}</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
