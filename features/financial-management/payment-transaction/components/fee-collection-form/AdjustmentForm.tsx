// components/AdjustmentForm.tsx - Clean, minimal design
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FormInput, FormSelect, FormTextarea } from '@/components/school-form'
import { Plus, Calculator } from 'lucide-react'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { DueAdjustmentType, DueAdjustmentTypeSchema } from '@/lib/zod'
import { DueAdjustmentStatus } from '@prisma/client'
import { currencySimbols } from '@/constants/constants'
import { createDueAdjustment } from '@/features/financial-management/dueAdjustment/api/dueAdjustment.action'
import { useDiscountCategories } from '@/hooks/queries/all-quries'
import DialogWrapper from '@/components/Dialog-Wrapper'
import DiscountCategoryForm from '@/features/financial-management/feeItem/components/DiscountCategoryForm'

interface AdjustmentFormProps {
	dueItemId: string
	onSuccess: () => void
	onCancel: () => void
}

interface AdjustmentData {
	title: string
	amount: number
	type: DueAdjustmentType
	categoryId: string
	reason: string
}

export const AdjustmentForm: React.FC<AdjustmentFormProps> = ({
	dueItemId,
	onSuccess,
	onCancel,
}) => {
	const { data: discountCategories, isLoading } = useDiscountCategories()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState<AdjustmentData>({
		title: '',
		amount: 0,
		type: 'DISCOUNT',
		categoryId: '',
		reason: '',
	})

	const handleSubmit = async () => {
		setIsSubmitting(true)
		try {
			const adjustmentPayload = {
				dueItemId,
				title: formData.title,
				amount: formData.amount,
				type: formData.type,
				categoryId: formData.categoryId,
				reason: formData.reason || '',
				status: DueAdjustmentStatus.ACTIVE,
			}

			await createDueAdjustment(adjustmentPayload as any)
			onSuccess()
		} catch (error) {
			console.error('Error creating adjustment:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const updateFormData = (field: keyof AdjustmentData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	return (
		<div className="bg-amber-50 rounded-lg p-4 space-y-4 border border-amber-200">
			<div className="flex items-center gap-2">
				<div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
					<Calculator className="h-3 w-3 text-amber-600" />
				</div>
				<h5 className="font-medium text-amber-900">Fee Adjustment</h5>
			</div>

			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-amber-800">Title</label>
						<FormInput
							name="adjustmentTitle"
							type="text"
							placeholder="e.g., Early payment discount"
							value={formData.title}
							onChange={value => updateFormData('title', value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-amber-800">Amount</label>
						<FormInput
							name="adjustmentAmount"
							type="decimal"
							currencySymbol={currencySimbols.BDT}
							placeholder="0.00"
							value={formData.amount}
							onChange={value =>
								updateFormData('amount', parseFloat(value) || 0)
							}
							required
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-amber-800">Type</label>
						<FormSelect
							name="adjustmentType"
							placeholder="Select type"
							value={formData.type}
							onChange={value =>
								updateFormData('type', value as DueAdjustmentType)
							}
							options={enumToOptions(DueAdjustmentTypeSchema.enum)}
							required
						/>
					</div>

					<div className="flex items-end gap-2">
						<div className="space-y-2 flex-1">
							<label className="text-sm font-medium text-amber-800">
								Category
							</label>
							<FormSelect
								name="adjustmentCategory"
								placeholder="Select category"
								value={formData.categoryId}
								onChange={value =>
									updateFormData('categoryId', value as string)
								}
								options={discountCategories || []}
								isLoading={isLoading}
								required
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
								<DiscountCategoryForm onSuccess={onSuccess} />
							)}
						</DialogWrapper>
					</div>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium text-amber-800">
						Reason (Optional)
					</label>
					<FormTextarea
						name="adjustmentReason"
						placeholder="Enter reason for this adjustment"
						rows={2}
						value={formData.reason}
						onChange={value => updateFormData('reason', value)}
					/>
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<Button
						type="button"
						variant="ghost"
						onClick={onCancel}
						disabled={isSubmitting}
						size="sm"
						className="text-amber-700 hover:bg-amber-100"
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting}
						size="sm"
						className="bg-amber-600 hover:bg-amber-700 text-white"
					>
						{isSubmitting ? (
							'Processing...'
						) : (
							<>
								<Plus className="h-3 w-3 mr-1" />
								Apply
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
