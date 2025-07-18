import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
} from '@/components/school-form'
import {
	Tenant,
	CreateTenantInput,
	CreateTenantInputSchema,
	UpdateTenantInput,
} from '@/lib/zod'
import { createTenant, updateTenant } from '../api/tenant.action'
import { CirclePlus } from 'lucide-react'

export default function TenantForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: Tenant
}) {
	return (
		<FormProvider
			schema={CreateTenantInputSchema}
			defaultValues={item}
			onSubmit={async data => {
				try {
					if (item) {
						await updateTenant(item.id, data as UpdateTenantInput)
					} else {
						await createTenant(data as CreateTenantInput)
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
							error instanceof Error
								? error.message
								: 'Failed to create tenant',
					}
				}
			}}
		>
			<FormRoot className="">
				<FormInput
					name="name"
					label="Tenant Name"
					placeholder="Enter tenant name"
					required
				/>

				<FormSubmit>
					<CirclePlus className="h-4 w-4" /> Create
				</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
