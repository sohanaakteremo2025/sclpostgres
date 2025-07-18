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
import { FundTransferInput, fundTransferSchema } from '../types'

interface FundTransferFormProps {
	onSuccess: () => void
}

export default function FundTransferForm({ onSuccess }: FundTransferFormProps) {
	const { data: tenantAccounts, isLoading } = useTenantAccounts()
	const [selectedFromAccount, setSelectedFromAccount] = useState<string>('')
	const onSubmitHandler = async (data: FundTransferInput) => {
		try {
			await fundTransfer(data)
			onSuccess()
			return {
				success: true,
				message: 'Fund transfer successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to transfer fund',
			}
		}
	}

	// Filter out the selected 'from' account from 'to' account options
	const filteredToAccounts = useMemo(() => {
		if (!tenantAccounts || !selectedFromAccount) {
			return tenantAccounts || []
		}
		return tenantAccounts.filter(
			account => account.value !== selectedFromAccount,
		)
	}, [tenantAccounts, selectedFromAccount])

	return (
		<FormProvider
			// schema={CreateTenantAccountInputSchema as any}
			schema={fundTransferSchema}
			isLoading={isLoading}
			onSubmit={onSubmitHandler}
		>
			<FormRoot>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormSelect
						name="fromTenantAccount"
						label="From"
						options={tenantAccounts || []}
						onChange={setSelectedFromAccount}
						required
					/>
					<FormSelect
						name="toTenantAccount"
						label="To"
						options={filteredToAccounts}
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

				<FormSubmit>Transfer</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
