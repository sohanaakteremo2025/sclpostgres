// components/MonthCollectionCard.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFormContext } from '@/components/school-form'
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/utils/currency-formatter'
import { FeeItemCard } from './FeeItemCard'
import { StudentDue, DueItem } from './types'
import {
	formatMonthYear,
	getUnpaidItems,
	calculateTotalDue,
	calculateRemainingAmount,
} from './utils'

interface MonthCollectionCardProps {
	index: number
	studentDues: StudentDue[]
	onRemoveMonth: () => void
	onAdjustmentApplied?: () => void
}

export const MonthCollectionCard: React.FC<MonthCollectionCardProps> = ({
	index,
	studentDues,
	onRemoveMonth,
	onAdjustmentApplied,
}) => {
	const { form } = useFormContext()

	const monthData = form.watch(`monthCollections.${index}`)
	if (!monthData) return null

	const due = studentDues.find(d => d.id === monthData.monthId)
	if (!due) return null

	const currentFormItems =
		form.watch(`monthCollections.${index}.feeItems`) || []
	const selectedItems = due.dueItems.filter(item =>
		currentFormItems.some((formItem: any) => formItem.dueItemId === item.id),
	)

	const totalDue = calculateTotalDue(selectedItems)
	const unpaidItems = getUnpaidItems(due)
	const availableToAdd = unpaidItems.filter(
		item => !selectedItems.some(selected => selected.id === item.id),
	)

	const handleAddItem = (item: DueItem) => {
		const newItemData = {
			dueItemId: item.id,
			collectAmount: calculateRemainingAmount(item),
			accountId: '',
		}
		const currentItems =
			form.getValues(`monthCollections.${index}.feeItems`) || []
		form.setValue(`monthCollections.${index}.feeItems`, [
			...currentItems,
			newItemData,
		])
	}

	const handleRemoveItem = (itemIndex: number) => {
		const currentItems =
			form.getValues(`monthCollections.${index}.feeItems`) || []
		const updatedItems = currentItems.filter(
			(_: any, i: number) => i !== itemIndex,
		)
		form.setValue(`monthCollections.${index}.feeItems`, updatedItems)
	}

	const handleAddAllItems = () => {
		const newItems = availableToAdd.map(item => ({
			dueItemId: item.id,
			collectAmount: calculateRemainingAmount(item),
			accountId: '',
		}))
		const currentItems =
			form.getValues(`monthCollections.${index}.feeItems`) || []
		form.setValue(`monthCollections.${index}.feeItems`, [
			...currentItems,
			...newItems,
		])
	}

	return (
		<div className="bg-white border rounded-xl overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
							<Calendar className="h-5 w-5 text-white" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white">
								{formatMonthYear(due.month, due.year)}
							</h3>
							<p className="text-blue-100 text-sm">
								{selectedItems.length} of {unpaidItems.length} items selected
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="text-right">
							<p className="text-blue-100 text-xs">Total Amount</p>
							<p className="text-white font-semibold text-lg">
								{formatCurrency(totalDue, { currency: 'BDT' })}
							</p>
						</div>
						{/* <Button
							type="button"
							size="sm"
							variant="ghost"
							onClick={onRemoveMonth}
							className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-lg"
						>
							<Trash2 className="h-4 w-4" />
						</Button> */}
					</div>
				</div>
			</div>

			<div className="p-6 space-y-6">
				{/* Available Items - Clean Grid Layout */}
				{availableToAdd.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-medium text-slate-700">
								Available Items ({availableToAdd.length})
							</h4>
							<Button
								type="button"
								size="sm"
								onClick={handleAddAllItems}
								className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
							>
								<Plus className="h-3 w-3 mr-1" />
								Add All
							</Button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{availableToAdd.map(item => (
								<button
									key={item.id}
									type="button"
									onClick={() => handleAddItem(item)}
									className="p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
								>
									<div className="flex items-center justify-between">
										<div className="min-w-0 flex-1">
											<p className="font-medium text-sm text-slate-900 truncate group-hover:text-blue-900">
												{item.title}
											</p>
											<p className="text-xs text-slate-500 mt-1">
												{formatCurrency(calculateRemainingAmount(item), {
													currency: 'BDT',
												})}
											</p>
										</div>
										<Plus className="h-4 w-4 text-slate-400 group-hover:text-blue-600 ml-2" />
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				{/* Selected Items or Empty State */}
				{selectedItems.length === 0 ? (
					<div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
						<div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
							<AlertCircle className="h-8 w-8 text-slate-400" />
						</div>
						<h3 className="font-medium text-slate-900 mb-2">
							No Items Selected
						</h3>
						<p className="text-slate-500 text-sm mb-4 max-w-sm mx-auto">
							Choose fee items from the available list above to start collecting
							payments
						</p>
						{availableToAdd.length > 0 && (
							<Button
								type="button"
								onClick={handleAddAllItems}
								className="bg-blue-600 hover:bg-blue-700"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add All Items
							</Button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-slate-900">
								Selected Items ({selectedItems.length})
							</h4>
							<div className="px-3 py-1 bg-blue-50 rounded-full">
								<span className="text-sm font-medium text-blue-700">
									Total: {formatCurrency(totalDue, { currency: 'BDT' })}
								</span>
							</div>
						</div>

						<div className="space-y-3">
							{selectedItems.map(item => {
								const formIndex = currentFormItems.findIndex(
									(formItem: any) => formItem.dueItemId === item.id,
								)
								return (
									<FeeItemCard
										key={item.id}
										monthIndex={index}
										itemIndex={formIndex}
										item={item}
										onRemove={() => handleRemoveItem(formIndex)}
										onAdjustmentApplied={onAdjustmentApplied}
									/>
								)
							})}
						</div>
					</div>
				)}

				{/* Hidden Fields */}
				<div className="hidden">
					<input
						type="hidden"
						{...form.register(`monthCollections.${index}.monthId`)}
						value={due.id}
					/>
					<input
						type="hidden"
						{...form.register(`monthCollections.${index}.month`)}
						value={due.month}
					/>
					<input
						type="hidden"
						{...form.register(`monthCollections.${index}.year`)}
						value={due.year}
					/>
				</div>
			</div>
		</div>
	)
}
