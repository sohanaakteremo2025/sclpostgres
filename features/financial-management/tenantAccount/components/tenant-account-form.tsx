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
	UpdateTenantAccountInput,
	CreateTenantAccountInput,
	CreateTenantAccountInputSchema,
	TransactionTypeSchema,
	AccountTypeSchema,
} from '@/lib/zod'
import {
	createTenantAccount,
	updateTenantAccount,
} from '../api/tenantAccount.action'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import {
	useTenantAccounts,
	useTenantTransactionCategories,
} from '@/hooks/queries/all-quries'
import { TenantAccount } from '@/lib/zod'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { currencySimbols } from '@/constants/constants'

interface TenantAccountFormProps {
	onSuccess: () => void
	item?: TenantAccount
}

export default function TenantAccountForm({
	onSuccess,
	item,
}: TenantAccountFormProps) {
	const onSubmitHandler = async (data: CreateTenantAccountInput) => {
		try {
			if (item) {
				await updateTenantAccount(item.id, data as UpdateTenantAccountInput)
				onSuccess()
				return {
					success: true,
					message: 'Section updated successfully!',
				}
			} else {
				await createTenantAccount(data as CreateTenantAccountInput)
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
			schema={CreateTenantAccountInputSchema as any}
			defaultValues={item}
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput
						name="title"
						placeholder="eg: bonus salary"
						label="Title"
						required
					/>
					<FormSelect
						name="type"
						options={enumToOptions(AccountTypeSchema.enum)}
						label="Type"
						placeholder="Select account type"
						required
					/>
					<FormInput
						name="balance"
						placeholder="Enter balance"
						label="Balance"
						type="decimal"
						currencySymbol={currencySimbols.BDT}
						disabled={item?.balance !== undefined}
						required
					/>
				</div>

				<FormSubmit>{item ? 'Update' : 'Create'}</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
