import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormArray,
	FormSelect,
	FormCheckbox,
	useFormContext,
	FormTextarea,
} from '@/components/school-form'
import {
	CreateFeeStructureInputSchema,
	FeeFrequencySchema,
	FeeItemStatusSchema,
	LateFeeFrequencySchema,
	CreateFeeItemInputSchema,
} from '@/lib/zod'
import {
	createFeeStructure,
	updateFeeStructure,
} from '../api/feestructure.action'
import { CirclePlus, Plus } from 'lucide-react'
import { cleanErrorMessage } from '@/utils/clean-prisma-error'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { currencySimbols } from '@/constants/constants'
import { z } from 'zod'
import DialogWrapper from '@/components/Dialog-Wrapper'
import { Button } from '@/components/ui/button'
import TransactionCategoryForm from '../../transactionCategory/components/TransactionCategoryForm'
import { useFeeItemCategories } from '@/hooks/queries/all-quries'
import FeeItemCategoryForm from '../../feeItem/components/FeeItemCategoryForm'

function FeeItems({ index }: { index: number }) {
	const { form } = useFormContext()
	const { data: categories = [], isLoading: categoriesLoading } =
		useFeeItemCategories()
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					name={`feeItems.${index}.name`}
					label="Fee Item Name"
					placeholder="eg: Tuition Fee"
					required
				/>
				<FormInput
					name={`feeItems.${index}.amount`}
					label="Amount"
					type="decimal"
					currencySymbol={currencySimbols.BDT}
					placeholder="Enter amount"
					required
				/>
				<div className="col-span-2 flex items-end gap-2">
					<div className="flex-1">
						<FormSelect
							name={`feeItems.${index}.categoryId`}
							label="Category"
							options={categories}
							isLoading={categoriesLoading}
							placeholder="Select category"
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
						{({ onSuccess }) => <FeeItemCategoryForm onSuccess={onSuccess} />}
					</DialogWrapper>
				</div>
				<FormSelect
					name={`feeItems.${index}.frequency`}
					label="Frequency"
					options={enumToOptions(FeeFrequencySchema.enum)}
					placeholder="Select frequency"
					required
				/>
				<FormSelect
					name={`feeItems.${index}.status`}
					label="Status"
					options={enumToOptions(FeeItemStatusSchema.enum)}
					placeholder="Select status"
					required
				/>

				<div className="col-span-2">
					<FormTextarea
						name={`feeItems.${index}.description`}
						label="Description"
						placeholder="Enter description"
					/>
				</div>
			</div>
			<FormCheckbox
				name={`feeItems.${index}.lateFeeEnabled`}
				label="Late Fee Enabled"
			/>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FormInput
					name={`feeItems.${index}.lateFeeAmount`}
					label="Late Fee Amount"
					type="decimal"
					currencySymbol={currencySimbols.BDT}
					placeholder="Enter late fee amount"
					disabled={!form.watch(`feeItems.${index}.lateFeeEnabled`)}
				/>
				<FormInput
					name={`feeItems.${index}.lateFeeGraceDays`}
					label="Late Fee Grace Days"
					type="number"
					placeholder="Enter late fee grace days"
					disabled={!form.watch(`feeItems.${index}.lateFeeEnabled`)}
				/>
				<FormSelect
					name={`feeItems.${index}.lateFeeFrequency`}
					label="Late Fee Frequency"
					options={enumToOptions(LateFeeFrequencySchema.enum)}
					placeholder="Select late fee frequency"
					disabled={!form.watch(`feeItems.${index}.lateFeeEnabled`)}
				/>
			</div>
		</div>
	)
}

export default function FeeStructureForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: any
}) {
	const onSubmitHandler = async (data: any) => {
		console.log(data)

		try {
			if (item) {
				await updateFeeStructure(item.id, data)
				onSuccess()
				return {
					success: true,
					message: 'Fee Structure updated successfully!',
				}
			} else {
				await createFeeStructure(data)
				onSuccess()
				return {
					success: true,
					message: 'Fee Structure created successfully!',
				}
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? cleanErrorMessage(error)
						: 'Failed to create fee structure',
			}
		}
	}

	const getDefaultFeeItem = () => ({
		lateFeeEnabled: false,
		lateFeeAmount: 0,
		lateFeeGraceDays: 0,
		lateFeeFrequency: 'MONTHLY',
	})

	return (
		<FormProvider
			schema={CreateFeeStructureInputSchema.extend({
				feeItems: z.array(
					CreateFeeItemInputSchema.omit({ feeStructureId: true }),
				),
			})}
			defaultValues={item}
			onSubmit={onSubmitHandler}
		>
			<FormRoot className="">
				<FormInput
					name="title"
					label="Fee Structure Title"
					placeholder="Enter fee structure title"
					required
				/>

				<FormArray
					name="feeItems"
					isMultiStepForm={false}
					defaultItem={getDefaultFeeItem}
					initialData={item?.feeItems || []}
					addButtonLabel="Add Fee Item"
					className="space-y-6"
				>
					{(_, index) => <FeeItems index={index} />}
				</FormArray>

				<FormSubmit>
					<CirclePlus className="h-4 w-4" /> Create
				</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
