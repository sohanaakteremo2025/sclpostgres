import React, { useEffect, useRef } from 'react'
import { useFieldArray, FieldValues, ArrayPath } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import {
	useFormContext,
	useMultiStepFormContext,
} from '@/components/school-form'

interface FormArrayProps<TFieldValues extends FieldValues> {
	name: ArrayPath<TFieldValues>
	label?: string
	isMultiStepForm?: boolean
	description?: string
	defaultItem?: () => any
	initialData?: any[]
	minItems?: number
	maxItems?: number
	children: (item: any, index: number, remove: () => void) => React.ReactNode
	addButtonLabel?: string
	className?: string
	hideAddButton?: boolean // New prop to hide the add button
}

export function FormArray<TFieldValues extends FieldValues>({
	name,
	label,
	isMultiStepForm = true,
	description,
	defaultItem,
	initialData,
	minItems = 0,
	maxItems = 10,
	children,
	addButtonLabel = 'Add Item',
	className,
	hideAddButton = false, // Default to false (show button)
}: FormArrayProps<TFieldValues>) {
	const form = isMultiStepForm
		? useMultiStepFormContext<TFieldValues>()?.form
		: useFormContext<TFieldValues>()?.form

	const { fields, append, remove, replace } = useFieldArray({
		control: form?.control,
		name,
	})

	// Track if we've already initialized to prevent re-initialization
	const hasInitialized = useRef(false)

	// Initialize with existing data if provided - but only once
	useEffect(() => {
		if (hasInitialized.current) return

		if (initialData && initialData.length > 0 && fields.length === 0) {
			// Replace the empty array with initial data
			replace(initialData)
			hasInitialized.current = true
		} else if (!initialData && fields.length === 0 && minItems > 0) {
			// If no initial data but minItems required, add default items
			const defaultItems = Array.from({ length: minItems }, () =>
				defaultItem?.(),
			)
			replace(defaultItems)
			hasInitialized.current = true
		} else if (fields.length > 0) {
			// Mark as initialized if there are already fields
			hasInitialized.current = true
		}
	}, [initialData, fields.length, minItems, replace, defaultItem])

	const canAdd = fields.length < maxItems
	const canRemove = fields.length > minItems

	const handleAdd = () => {
		if (canAdd) {
			append(defaultItem?.())
		}
	}

	const handleRemove = (index: number) => {
		if (canRemove) {
			remove(index)
		}
	}

	return (
		<div className={className}>
			{label && (
				<div className="mb-4">
					<h3 className="text-lg font-medium">{label}</h3>
					{description && (
						<p className="text-sm text-muted-foreground mt-1">{description}</p>
					)}
				</div>
			)}

			<div className="space-y-6">
				{fields.map((field, index) => (
					<Card key={field.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
							<h4 className="font-medium text-sm text-gray-700">
								{label ? `${label} ${index + 1}` : `Item ${index + 1}`}
							</h4>
							{canRemove && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => handleRemove(index)}
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</CardHeader>
						<CardContent>
							{children(field, index, () => handleRemove(index))}
						</CardContent>
					</Card>
				))}

				{/* {fields.length === 0 && (
					<Card>
						<CardContent className="text-center py-8 text-gray-500">
							<p>No items added yet</p>
						</CardContent>
					</Card>
				)} */}

				{/* Only show add button if hideAddButton is false */}
				{!hideAddButton && canAdd && (
					<Button
						type="button"
						variant="outline"
						onClick={handleAdd}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						{addButtonLabel}
					</Button>
				)}

				{!hideAddButton && !canAdd && (
					<p className="text-sm text-gray-500 text-center">
						Maximum {maxItems} items allowed
					</p>
				)}
			</div>
		</div>
	)
}
