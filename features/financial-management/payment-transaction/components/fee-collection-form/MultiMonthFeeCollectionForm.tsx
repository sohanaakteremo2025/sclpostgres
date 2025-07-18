// MultiMonthFeeCollectionForm.tsx - Minimal Fix Version
import React, { useState, useEffect, useCallback } from 'react'
import {
	FormProvider,
	FormRoot,
	FormArray,
	FormTextarea,
	FormSubmit,
	useFormContext,
} from '@/components/school-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HandCoins, Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { processPaymentAction } from '@/features/financial-management/studentPayment/api/studentPayment.action'
import { formatCurrency } from '@/utils/currency-formatter'

// Import components
import { AvailableDuesSection } from './AvailableDuesSection'
import { MonthCollectionCard } from './MonthCollectionCard'
import {
	StudentDue,
	FeeCollectionFormSchema,
	FeeCollectionFormData,
	UIState,
} from './types'
import {
	saveUIState,
	loadUIState,
	getUnpaidItems,
	calculateTotalDue,
} from './utils'

// Empty State Component
function EmptyMonthHOC({ children }: { children: React.ReactNode }) {
	const { form } = useFormContext()
	const monthCollections = form?.watch('monthCollections') || []

	if (monthCollections.length > 0) {
		return children
	}

	return null
}

interface MultiMonthFeeCollectionFormProps {
	onSuccess: () => void
	dues: { dues: StudentDue[]; studentId: string }
}

export default function MultiMonthFeeCollectionForm({
	onSuccess,
	dues,
}: MultiMonthFeeCollectionFormProps) {
	// UI State Management
	const [uiState, setUIState] = useState<UIState>(() => {
		const saved = loadUIState(dues.studentId)
		if (saved) {
			return {
				expandedDues: new Set(saved.expandedDues || []),
				selectedMonths: new Set(saved.selectedMonths || []),
				adjustmentForms: new Set(saved.adjustmentForms || []),
			}
		}
		return {
			expandedDues: new Set<string>(),
			selectedMonths: new Set<string>(),
			adjustmentForms: new Set<string>(),
		}
	})

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)

	// Save UI state whenever it changes
	useEffect(() => {
		saveUIState(dues.studentId, uiState)
	}, [uiState, dues.studentId])

	// UI State Handlers
	const handleToggleExpand = useCallback((dueId: string) => {
		setUIState(prev => {
			const newExpanded = new Set(prev.expandedDues)
			if (newExpanded.has(dueId)) {
				newExpanded.delete(dueId)
			} else {
				newExpanded.add(dueId)
			}
			return { ...prev, expandedDues: newExpanded }
		})
	}, [])

	const handleAdjustmentApplied = useCallback(() => {
		onSuccess() // Refetch data after adjustment - DON'T clear UI state
	}, [onSuccess])

	// Calculate unpaid items
	const duesWithUnpaidItems = dues.dues.filter(
		due => getUnpaidItems(due).length > 0,
	)

	// Form submission handler
	const onSubmitHandler = async (data: FeeCollectionFormData) => {
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			const payments = data.monthCollections.map(month => ({
				month: month.month,
				year: month.year,
				dueItems: month.feeItems,
				reason: data.reason || 'Fee Collection',
				studentId: dues.studentId,
			}))

			await processPaymentAction(payments)

			// MINIMAL FIX: Don't clear UI state - let user continue working
			// setUIState({
			// 	expandedDues: new Set(),
			// 	selectedMonths: new Set(),
			// 	adjustmentForms: new Set(),
			// })

			onSuccess() // Refetch data after successful payment

			return {
				success: true,
				message: 'Fee collection completed successfully!',
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to process fee collection'

			setSubmitError(errorMessage)

			return {
				success: false,
				message: errorMessage,
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	// Calculate totals for display
	const totalOutstanding = duesWithUnpaidItems.reduce(
		(sum, due) => sum + calculateTotalDue(getUnpaidItems(due)),
		0,
	)

	if (duesWithUnpaidItems.length === 0) {
		return (
			<Card className="bg-green-50 border-green-200">
				<CardContent className="text-center py-12">
					<CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
					<h2 className="text-xl font-semibold text-green-900 mb-2">
						All Fees Paid!
					</h2>
					<p className="text-green-700">
						This student has no outstanding dues to collect.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-8">
			<FormProvider
				schema={FeeCollectionFormSchema}
				defaultValues={{
					reason: 'Monthly Fee Collection',
					monthCollections: [],
				}}
				onSubmit={onSubmitHandler}
			>
				<FormRoot className="space-y-8">
					{/* Error Alert */}
					{submitError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}

					{/* Available Dues Section */}
					<AvailableDuesSection
						studentDues={duesWithUnpaidItems}
						expandedDues={uiState.expandedDues}
						onToggleExpand={handleToggleExpand}
					/>

					{/* Collection Form Section */}
					<EmptyMonthHOC>
						<Card className="shadow-none">
							<CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
								<CardTitle className="flex items-center gap-3 text-xl text-blue-900">
									<HandCoins className="h-6 w-6" />
									Fee Collection Form
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								{/* Notes Section */}
								<FormTextarea
									name="reason"
									label="Collection Notes (Optional)"
									placeholder="Enter any additional notes for this fee collection..."
									rows={3}
								/>

								{/* Month Collections */}
								<div className="space-y-6">
									<FormArray
										name="monthCollections"
										isMultiStepForm={false}
										defaultItem={() => ({
											monthId: '',
											month: 0,
											year: 0,
											feeItems: [],
										})}
										hideAddButton={true}
										className="space-y-6"
									>
										{(field, index, remove) => (
											<MonthCollectionCard
												index={index}
												studentDues={dues.dues}
												onRemoveMonth={() => remove()}
												onAdjustmentApplied={handleAdjustmentApplied}
											/>
										)}
									</FormArray>
								</div>

								{/* Summary and Submit */}
								<div className="border-t pt-6">
									<div className="flex items-center justify-between">
										<div className="text-sm text-gray-600">
											<p>
												Total Outstanding:{' '}
												<span className="font-semibold text-red-600">
													{formatCurrency(totalOutstanding, {
														currency: 'BDT',
													})}
												</span>
											</p>
										</div>

										<FormSubmit
											className="min-w-[200px] bg-green-600 hover:bg-green-700"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>Processing...</>
											) : (
												<>
													<HandCoins className="h-4 w-4 mr-2" />
													Process Fee Collection
												</>
											)}
										</FormSubmit>
									</div>
								</div>
							</CardContent>
						</Card>
					</EmptyMonthHOC>
				</FormRoot>
			</FormProvider>
		</div>
	)
}
