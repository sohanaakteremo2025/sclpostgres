// components/FeeItemCard.tsx - With collection amount validation
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FormInput, FormSelect, useFormContext } from '@/components/school-form'
import { X, RotateCcw, Plus, Minus, Receipt, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/utils/currency-formatter'
import { currencySimbols } from '@/constants/constants'
import { useTenantAccounts } from '@/hooks/queries/all-quries'
import { StatusBadge } from './StatusBadge'
import { AdjustmentForm } from './AdjustmentForm'
import { DueItem } from './types'
import { calculateRemainingAmount } from './utils'

interface FeeItemCardProps {
	monthIndex: number
	itemIndex: number
	item: DueItem
	onRemove: () => void
	onAdjustmentApplied?: () => void
}

export const FeeItemCard: React.FC<FeeItemCardProps> = ({
	monthIndex,
	itemIndex,
	item,
	onRemove,
	onAdjustmentApplied,
}) => {
	const { form } = useFormContext()
	const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)
	const [amountError, setAmountError] = useState<string | null>(null)
	const { data: accounts, isLoading: isLoadingAccounts } = useTenantAccounts()

	const remaining = calculateRemainingAmount(item)
	const collectAmount =
		form.watch(
			`monthCollections.${monthIndex}.feeItems.${itemIndex}.collectAmount`,
		) || 0

	// Validate amount whenever it changes
	useEffect(() => {
		const amount = parseFloat(collectAmount) || 0
		if (amount > remaining) {
			setAmountError(
				`Cannot collect more than ${formatCurrency(remaining, { currency: 'BDT' })}`,
			)
		} else {
			setAmountError(null)
		}
	}, [collectAmount, remaining])

	const handleAmountChange = (value: string) => {
		const amount = parseFloat(value) || 0

		if (amount > remaining) {
			form.setValue(
				`monthCollections.${monthIndex}.feeItems.${itemIndex}.collectAmount`,
				amount,
				{ shouldValidate: true },
			)
		} else {
			form.setValue(
				`monthCollections.${monthIndex}.feeItems.${itemIndex}.collectAmount`,
				amount,
				{ shouldValidate: true },
			)
		}
	}

	const handleQuickFill = (percentage: number) => {
		const amount = Math.round(((remaining * percentage) / 100) * 100) / 100
		form.setValue(
			`monthCollections.${monthIndex}.feeItems.${itemIndex}.collectAmount`,
			amount,
			{ shouldValidate: true },
		)
	}

	const handleAdjustmentSuccess = () => {
		setShowAdjustmentForm(false)
		onAdjustmentApplied?.()
	}

	const progressPercentage = Math.min(
		Math.round((collectAmount / remaining) * 100),
		100,
	)

	return (
		<div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
			{/* Header */}
			<div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-xs">
						<Receipt className="h-4 w-4 text-blue-600" />
					</div>
					<div className="min-w-0">
						<h4 className="text-sm font-semibold text-slate-900 truncate">
							{item.title}
						</h4>
						<div className="flex items-center gap-1.5 mt-0.5">
							<span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
								{item.category}
							</span>
							<StatusBadge status={item.status} />
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="text-right">
						<p className="text-xs text-slate-500">Due</p>
						<p className="text-sm font-semibold text-red-600">
							{formatCurrency(remaining, { currency: 'BDT' })}
						</p>
					</div>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						onClick={onRemove}
						className="h-7 w-7 text-slate-500 hover:text-red-500 hover:bg-red-50"
					>
						<X className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-3 space-y-3">
				{/* Quick Actions */}
				<div className="flex items-center justify-between gap-2">
					<div className="flex gap-1 flex-wrap">
						{[25, 50, 75, 100].map(percentage => (
							<button
								key={percentage}
								type="button"
								onClick={() => handleQuickFill(percentage)}
								className="px-2 py-1 text-xs bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded transition-colors"
							>
								{percentage}%
							</button>
						))}
					</div>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={() => handleQuickFill(100)}
						className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50 h-7"
					>
						<RotateCcw className="h-3 w-3" />
						Reset Amount
					</Button>
				</div>

				{/* Collection Form */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div className="space-y-1">
						<label className="text-xs font-medium text-slate-700">Amount</label>
						<div className="relative">
							<FormInput
								name={`monthCollections.${monthIndex}.feeItems.${itemIndex}.collectAmount`}
								type="decimal"
								required
								currencySymbol={currencySimbols.BDT}
								placeholder="0.00"
								value={collectAmount}
								onChange={handleAmountChange}
							/>
							{amountError && (
								<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
									<AlertCircle className="h-4 w-4 text-red-500" />
								</div>
							)}
						</div>
						{/* Amount Error */}
						{amountError && (
							<div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 text-xs rounded">
								<AlertCircle className="h-4 w-4" />
								<span>{amountError}</span>
							</div>
						)}
					</div>

					<div className="space-y-1">
						<label className="text-xs font-medium text-slate-700">
							Account
						</label>
						<FormSelect
							name={`monthCollections.${monthIndex}.feeItems.${itemIndex}.accountId`}
							placeholder="Select account"
							required
							isLoading={isLoadingAccounts}
							options={accounts || []}
						/>
					</div>
				</div>

				{/* Progress */}
				<div className="space-y-1.5">
					<div className="flex justify-between text-xs">
						<span className="text-slate-600">
							{formatCurrency(collectAmount, { currency: 'BDT' })} collected
						</span>
						<span
							className={`font-medium ${
								progressPercentage === 100 ? 'text-green-600' : 'text-blue-600'
							}`}
						>
							{progressPercentage}%
						</span>
					</div>
					<div className="w-full bg-slate-200 rounded-full h-1.5">
						<div
							className={`h-1.5 rounded-full transition-all duration-300 ${
								progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
							}`}
							style={{ width: `${progressPercentage}%` }}
						></div>
					</div>
					<div className="flex justify-between text-xs text-slate-500">
						<span>
							Remaining:{' '}
							{formatCurrency(Math.max(remaining - collectAmount, 0), {
								currency: 'BDT',
							})}
						</span>
						<span>
							{progressPercentage === 100 ? 'Paid in full' : 'Partial payment'}
						</span>
					</div>
				</div>

				{/* Adjustment Button */}
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onClick={() => setShowAdjustmentForm(!showAdjustmentForm)}
					className="w-full text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8"
				>
					{showAdjustmentForm ? (
						<>
							<Minus className="h-3 w-3 mr-1.5" />
							Cancel adjustment
						</>
					) : (
						<>
							<Plus className="h-3 w-3 mr-1.5" />
							Add adjustment
						</>
					)}
				</Button>

				{/* Adjustment Form */}
				{showAdjustmentForm && (
					<div className="pt-2 mt-2 border-t border-slate-100">
						<AdjustmentForm
							dueItemId={item.id}
							onSuccess={handleAdjustmentSuccess}
							onCancel={() => setShowAdjustmentForm(false)}
						/>
					</div>
				)}
			</div>

			{/* Hidden Fields */}
			<input
				type="hidden"
				{...form.register(
					`monthCollections.${monthIndex}.feeItems.${itemIndex}.dueItemId`,
				)}
				value={item.id}
			/>
		</div>
	)
}
