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
	withdrawFund,
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
import { WithdrawInput, withdrawInputSchema } from '../types'

interface FundWithdrawalFormProps {
	onSuccess: () => void
}

export default function FundWithdrawalForm({
	onSuccess,
}: FundWithdrawalFormProps) {
	const { data: tenantAccounts, isLoading } = useTenantAccounts()
	const onSubmitHandler = async (data: WithdrawInput) => {
		try {
			await withdrawFund(data)
			onSuccess()
			return {
				success: true,
				message: 'Fund withdrawal successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to withdraw fund',
			}
		}
	}

	return (
		<FormProvider
			// schema={CreateTenantAccountInputSchema as any}
			schema={withdrawInputSchema}
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

				<FormSubmit>Withdraw</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
