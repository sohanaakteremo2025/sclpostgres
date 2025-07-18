import React from 'react'
import {
	FormInput,
	FormStep,
	StepIndicator,
	MultiStepFormRoot,
	StepContent,
	FormTextarea,
	FormSelect,
	StepNavigation,
	FormPhotoUpload,
	FormDatePicker,
	FormArray,
	MultiStepFormProvider,
} from '@/components/school-form'

import {
	CreateTenantInputSchema,
	TenantStatusSchema,
	BillingStatusSchema,
	BillingTypeSchema,
	BillingFrequencySchema,
} from '@/lib/zod'
import { createTenant, updateTenant } from '../api/tenant.action'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'
import { currencySimbols } from '@/constants/constants'

// Component for individual billing schedule item
function BillingScheduleItem({ index }: { index: number }) {
	return (
		<div className="space-y-4">
			<FormSelect
				label="Billing Type"
				name={`billingSchedules.${index}.billingType`}
				options={enumToOptions(BillingTypeSchema.enum)}
				placeholder="Select billing type"
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					name={`billingSchedules.${index}.label`}
					label="Title"
					placeholder="Schedule name"
					required
				/>
				<FormSelect
					name={`billingSchedules.${index}.status`}
					label="Status"
					options={enumToOptions(BillingStatusSchema.enum)}
					placeholder="Select status"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<FormInput
					name={`billingSchedules.${index}.amount`}
					label="Amount"
					type="decimal"
					currencySymbol={currencySimbols.BDT}
					placeholder="Enter amount"
					required
				/>
				<FormSelect
					name={`billingSchedules.${index}.frequency`}
					label="Frequency"
					options={enumToOptions(BillingFrequencySchema.enum)}
					placeholder="Select frequency"
					required
				/>
				<FormDatePicker
					name={`billingSchedules.${index}.nextDueDate`}
					label="Next Due Date"
					placeholder="Select next due date"
					required
				/>
			</div>
		</div>
	)
}

// Component for individual message item
function MessageItem({ index }: { index: number }) {
	return (
		<div className="space-y-4">
			<FormInput
				name={`messages.${index}.author`}
				label="Author Name"
				placeholder="Enter author name"
				required
			/>
			<FormInput
				name={`messages.${index}.title`}
				label="Author Role"
				placeholder="Author role"
				required
			/>
			<FormTextarea
				name={`messages.${index}.message`}
				label="Message"
				placeholder="Enter message content"
				required
			/>
			<FormPhotoUpload
				name={`messages.${index}.photo`}
				label="Photo"
				uploadUrl={process.env.NEXT_PUBLIC_UPLOAD_URL || ''}
				uploadPath="tenant"
			/>
		</div>
	)
}

export default function TenantForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: any
}) {
	const tenantRegistrationSteps: FormStep<any>[] = [
		{
			id: 'tenant-info',
			title: 'Tenant Info',
			fields: ['logo', 'name', 'email', 'phone', 'address', 'domain', 'status'],
		},
		{
			id: 'billing-schedules',
			title: 'Billing Schedules',
			fields: ['billingSchedules'],
		},
		{
			id: 'messages',
			title: 'Messages',
			fields: ['messages'],
		},
	]

	// Default billing schedule structure
	const getDefaultBillingSchedule = () => ({
		label: '',
		billingType: 'FIXED',
		amount: null,
		frequency: '',
		nextDueDate: null,
		status: 'ACTIVE',
	})

	const getDefaultMessage = () => ({
		author: '',
		title: '',
		message: '',
		photo: '',
	})

	const handleSubmit = async (data: any) => {
		try {
			if (item) {
				await updateTenant(item.id, data)
			} else {
				await createTenant(data)
			}
			onSuccess()
			return {
				success: true,
				message: 'Tenant created successfully!',
			}
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error ? error.message : 'Failed to create tenant',
			}
		}
	}

	return (
		<MultiStepFormProvider
			persistenceKey="tenant-form"
			schema={CreateTenantInputSchema}
			steps={tenantRegistrationSteps}
			onSubmit={handleSubmit}
			defaultValues={item}
		>
			<MultiStepFormRoot>
				<StepIndicator className="mb-0" clickable />

				{/* Step 1: Tenant Info */}
				<StepContent stepId="tenant-info">
					<div className="space-y-6">
						<div className="flex items-center justify-center gap-4">
							<FormPhotoUpload
								name="logo"
								label="Logo"
								uploadUrl={
									process.env.NEXT_PUBLIC_UPLOAD_URL ||
									'https://campaas.spiralvectors.com/upload.php'
								}
								uploadPath="tenant"
							/>
						</div>
						<FormInput
							name="name"
							label="Name"
							placeholder="Enter school name"
							required
						/>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormInput
								name="domain"
								label="Domain"
								placeholder="Enter school domain"
								required
							/>
							<FormSelect
								name="status"
								label="Status"
								options={enumToOptions(TenantStatusSchema.enum)}
								placeholder="Enter school status"
								required
							/>
						</div>
						<FormInput
							name="email"
							label="Email"
							placeholder="Enter school email"
							required
						/>
						<FormInput
							name="phone"
							label="Phone"
							placeholder="Enter tenant phone"
							required
						/>
						<FormTextarea
							name="address"
							label="Address"
							placeholder="Enter tenant address"
							required
						/>
					</div>
				</StepContent>

				{/* Step 2: Billing Schedules */}
				<StepContent stepId="billing-schedules">
					<FormArray
						name="billingSchedules"
						defaultItem={getDefaultBillingSchedule}
						initialData={item?.billingSchedules || []}
						minItems={1}
						maxItems={5}
						addButtonLabel="Add Billing Schedule"
						className="space-y-6"
					>
						{(_, index) => <BillingScheduleItem index={index} />}
					</FormArray>
				</StepContent>
				{/* Step 3: Messages */}
				<StepContent stepId="messages">
					<FormArray
						name="messages"
						defaultItem={getDefaultMessage}
						initialData={item?.messages || []}
						minItems={1}
						maxItems={5}
						addButtonLabel="Add Message"
						className="space-y-6"
					>
						{(_, index) => <MessageItem index={index} />}
					</FormArray>
				</StepContent>

				<StepNavigation
					submitLabel={item ? 'Update Tenant' : 'Register Tenant'}
					submitLoadingLabel={item ? 'Updating...' : 'Registering...'}
					className="border-t pt-6 mt-8"
				/>
			</MultiStepFormRoot>
		</MultiStepFormProvider>
	)
}
