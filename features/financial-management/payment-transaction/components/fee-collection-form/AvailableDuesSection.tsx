// components/AvailableDuesSection.tsx - Compact and beautiful design
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useFormContext } from '@/components/school-form'
import {
	Calendar,
	ChevronDown,
	ChevronRight,
	Plus,
	CheckCircle,
	DollarSign,
	Receipt,
	TrendingUp,
	TrendingDown,
} from 'lucide-react'
import { formatCurrency } from '@/utils/currency-formatter'
import { StatusBadge } from './StatusBadge'
import { StudentDue, DueItem } from './types'
import {
	formatMonthYear,
	getUnpaidItems,
	calculateTotalDue,
	calculateRemainingAmount,
	calculateTotalAdjustments,
	adjustmentAmountBasedOnType,
} from './utils'

interface AvailableDuesSectionProps {
	studentDues: StudentDue[]
	expandedDues: Set<string>
	onToggleExpand: (dueId: string) => void
}

const FeeItemFinancialBreakdown: React.FC<{ item: DueItem }> = ({ item }) => {
	const remaining = calculateRemainingAmount(item)
	const totalAdjustments = calculateTotalAdjustments(item)
	const hasAdjustments = item.adjustments.length > 0

	return (
		<div className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm">
			<div className="grid grid-cols-2 gap-4 p-3 text-sm">
				{/* Original Amount */}
				<div className="flex flex-col">
					<span className="text-slate-500 text-xs">Original Fee</span>
					<span className="font-medium text-slate-800">
						{formatCurrency(item.originalAmount, { currency: 'BDT' })}
					</span>
				</div>

				{/* Paid Amount */}
				<div className="flex flex-col">
					<span className="text-slate-500 text-xs">Paid</span>
					<span className="font-medium text-green-600">
						-{formatCurrency(item.paidAmount, { currency: 'BDT' })}
					</span>
				</div>

				{/* Adjustments */}
				{hasAdjustments && (
					<div className="flex flex-col col-span-2">
						<span className="text-slate-500 text-xs">Adjustments</span>
						<div className="mt-1 space-y-1">
							{item.adjustments.map(adj => {
								const adjustmentAmount = adjustmentAmountBasedOnType(
									adj.amount,
									adj.type,
								)
								return (
									<div key={adj.id} className="flex justify-between">
										<div className="flex items-center gap-2">
											<div className="w-1 h-1 bg-slate-400 rounded-full"></div>
											<span className="text-slate-700 text-sm">
												{adj.title}
											</span>
										</div>
										<span
											className={`font-medium text-sm ${
												adjustmentAmount >= 0
													? 'text-red-600'
													: 'text-green-600'
											}`}
										>
											{adjustmentAmount >= 0 ? '+' : ''}
											{formatCurrency(adjustmentAmount, { currency: 'BDT' })}
										</span>
									</div>
								)
							})}
						</div>
					</div>
				)}

				{/* Outstanding Balance */}
				<div className="flex flex-col col-span-2 pt-2 border-t border-slate-100 mt-2">
					<div className="flex justify-between items-center">
						<span className="font-medium text-slate-800">Outstanding</span>
						<span className="font-bold text-red-600">
							{formatCurrency(remaining, { currency: 'BDT' })}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export const AvailableDuesSection: React.FC<AvailableDuesSectionProps> = ({
	studentDues,
	expandedDues,
	onToggleExpand,
}) => {
	const { form } = useFormContext()

	const handleAddToCollection = (due: StudentDue) => {
		const currentMonthCollections = form.getValues('monthCollections') || []
		const exists = currentMonthCollections.some(
			(month: any) => month.monthId === due.id,
		)

		if (!exists) {
			const unpaidItems = getUnpaidItems(due)
			const newMonthData = {
				monthId: due.id,
				month: due.month,
				year: due.year,
				feeItems: unpaidItems.map(item => ({
					dueItemId: item.id,
					collectAmount: calculateRemainingAmount(item),
					accountId: '',
				})),
			}
			form.setValue('monthCollections', [
				...currentMonthCollections,
				newMonthData,
			])
		}
	}

	const isMonthAdded = (dueId: string): boolean => {
		const monthCollections = form.watch('monthCollections') || []
		return monthCollections.some((month: any) => month.monthId === dueId)
	}

	const duesWithUnpaidItems = studentDues.filter(
		due => getUnpaidItems(due).length > 0,
	)

	if (duesWithUnpaidItems.length === 0) {
		return (
			<div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
				<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
					<CheckCircle className="h-5 w-5 text-green-600" />
				</div>
				<h3 className="text-md font-semibold text-green-900 mb-1">
					All Fees Paid
				</h3>
				<p className="text-green-700 text-sm">No outstanding dues found.</p>
			</div>
		)
	}

	const totalOutstanding = duesWithUnpaidItems.reduce(
		(sum, due) => sum + calculateTotalDue(getUnpaidItems(due)),
		0,
	)

	return (
		<div className="space-y-4">
			{/* Section Header */}
			<div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-bold">Outstanding Dues</h2>
						<p className="text-red-100 text-xs opacity-90">
							Review and add to collection
						</p>
					</div>
					<div className="text-right">
						<p className="text-red-100 text-xs opacity-90">Total Outstanding</p>
						<p className="text-xl font-bold">
							{formatCurrency(totalOutstanding, { currency: 'BDT' })}
						</p>
					</div>
				</div>
			</div>

			{/* Dues List */}
			<div className="space-y-3">
				{duesWithUnpaidItems.map(due => {
					const unpaidItems = getUnpaidItems(due)
					const totalDue = calculateTotalDue(unpaidItems)
					const isExpanded = expandedDues.has(due.id)
					const isAdded = isMonthAdded(due.id)

					return (
						<div
							key={due.id}
							className={`bg-white rounded-lg border transition-all duration-200 ${
								isAdded
									? 'border-green-300 bg-green-50'
									: 'border-slate-200 hover:border-blue-300'
							}`}
						>
							<Collapsible
								open={isExpanded}
								onOpenChange={() => onToggleExpand(due.id)}
							>
								<CollapsibleTrigger asChild>
									<div className="p-4 cursor-pointer">
										<div className="flex items-center justify-between gap-3">
											<div className="flex items-center gap-3 min-w-0">
												<div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center shrink-0">
													{isExpanded ? (
														<ChevronDown className="h-3 w-3 text-blue-600" />
													) : (
														<ChevronRight className="h-3 w-3 text-blue-600" />
													)}
												</div>
												<div className="min-w-0">
													<h3 className="text-sm font-semibold text-slate-900 truncate">
														{formatMonthYear(due.month, due.year)}
													</h3>
													<div className="flex items-center gap-2 mt-1">
														<span className="text-xs text-slate-500">
															{unpaidItems.length} item
															{unpaidItems.length !== 1 ? 's' : ''}
														</span>
														<Badge
															variant="outline"
															className="text-red-600 border-red-200 px-1.5 py-0.5 h-auto"
														>
															{formatCurrency(totalDue, { currency: 'BDT' })}
														</Badge>
													</div>
												</div>
											</div>

											<Button
												type="button"
												onClick={e => {
													e.stopPropagation()
													handleAddToCollection(due)
												}}
												disabled={isAdded}
												size="sm"
												className={
													isAdded
														? 'bg-green-100 text-green-800 hover:bg-green-200 h-8'
														: 'bg-blue-600 hover:bg-blue-700 text-white h-8'
												}
											>
												{isAdded ? (
													<>
														<CheckCircle className="h-3 w-3" />
														Added
													</>
												) : (
													<>
														<Plus className="h-3 w-3" />
														Collect
													</>
												)}
											</Button>
										</div>
									</div>
								</CollapsibleTrigger>

								<CollapsibleContent>
									<div className="px-4 pb-4 pt-0">
										<div className="border-t border-slate-200 pt-3">
											<div className="space-y-3">
												{unpaidItems.map(item => (
													<div
														key={item.id}
														className="bg-slate-50 rounded-lg p-3 space-y-3"
													>
														{/* Item Header */}
														<div className="flex items-start justify-between gap-3">
															<div className="flex items-start gap-2 min-w-0">
																<div className="mt-0.5">
																	<StatusBadge status={item.status} />
																</div>
																<div className="min-w-0">
																	<h4 className="text-sm font-semibold text-slate-900 truncate">
																		{item.title}
																	</h4>
																	<p className="text-xs text-slate-600 mt-0.5">
																		{item.category}
																	</p>
																</div>
															</div>
															<div className="text-right shrink-0">
																<p className="text-xs text-slate-500">Due</p>
																<p className="font-bold text-red-600 text-sm">
																	{formatCurrency(
																		calculateRemainingAmount(item),
																		{ currency: 'BDT' },
																	)}
																</p>
															</div>
														</div>

														{/* Financial Breakdown */}
														<FeeItemFinancialBreakdown item={item} />
													</div>
												))}
											</div>
										</div>
									</div>
								</CollapsibleContent>
							</Collapsible>
						</div>
					)
				})}
			</div>
		</div>
	)
}
