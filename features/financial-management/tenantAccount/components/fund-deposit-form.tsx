'use client'
import React, { useMemo, useState } from 'react'
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
} from '@/lib/zod'
import {
	createTenantAccount,
	depositFund,
	fundTransfer,
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
import { z } from 'zod'
import { DepositInput, depositInputSchema } from '../types'

interface FundDepositFormProps {
	onSuccess: () => void
}

export default function FundDepositForm({ onSuccess }: FundDepositFormProps) {
	const { data: tenantAccounts, isLoading } = useTenantAccounts()
	const onSubmitHandler = async (data: DepositInput) => {
		try {
			await depositFund(data)
			onSuccess()
			return {
				success: true,
				message: 'Fund deposit successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to deposit fund',
			}
		}
	}

	return (
		<FormProvider
			// schema={CreateTenantAccountInputSchema as any}
			schema={depositInputSchema}
			isLoading={isLoading}
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormSelect
						name="accountId"
						label="Account"
						options={tenantAccounts || []}
						required
					/>
				</div>
				<FormInput
					name="amount"
					placeholder="Enter amount"
					label="Amount"
					type="decimal"
					currencySymbol={currencySimbols.BDT}
					required
				/>

				<FormSubmit>Deposit</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
