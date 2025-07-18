import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormPhotoUpload,
	FormPassword,
	FormSelect,
} from '@/components/school-form'
import {
	CreateUserPayload,
	CreateUserPayloadSchema,
	User,
	UserStatusSchema,
} from '@/lib/zod'
import { CirclePlus } from 'lucide-react'
import { updateUser, createUser } from '../api/user.actions'
import { UpdateUserInput } from '@/lib/zod'
import { useTenants } from '@/hooks/queries/all-quries'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'

export default function TenantAdminForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: User
}) {
	const { data: tenants, isLoading } = useTenants()

	return (
		<FormProvider
			schema={CreateUserPayloadSchema}
			defaultValues={item}
			isLoading={isLoading}
			loadingMessage="Loading tenants..."
			onSubmit={async data => {
				try {
					if (item) {
						await updateUser(item.id, data as UpdateUserInput)
						onSuccess()
						return {
							success: true,
							message: 'User updated successfully!',
						}
					} else {
						await createUser(data as CreateUserPayload)
						onSuccess()
						return {
							success: true,
							message: 'User created successfully!',
						}
					}
				} catch (error) {
					return {
						success: false,
						message:
							error instanceof Error ? error.message : 'Failed to create user',
					}
				}
			}}
		>
			<FormRoot className="">
				<FormPhotoUpload
					name="photo"
					label="Photo"
					uploadUrl={
						process.env.NEXT_PUBLIC_UPLOAD_URL ||
						'https://campaas.spiralvectors.com/upload.php'
					}
					uploadPath="tenant-admins"
					required={false}
				/>
				<FormSelect
					options={tenants || []}
					name="tenantId"
					label="Select School"
					placeholder="Select school"
					required
				/>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput
						name="name"
						label="Name"
						placeholder="Enter name"
						required
					/>
					<FormSelect
						options={enumToOptions(UserStatusSchema.enum)}
						name="status"
						label="User Status"
						placeholder="Select status"
						required
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput
						name="email"
						label="Email"
						placeholder="Enter email"
						required
					/>
					<FormPassword
						name="password"
						label="Password"
						placeholder="Enter password"
						showStrengthIndicator={false}
						required
					/>
				</div>
				<FormSelect
					options={[
						{ value: 'ADMIN', label: 'Admin' },
						{ value: 'SUPER_ADMIN', label: 'Super Admin' },
					]}
					name="role"
					label="Role"
					placeholder="Enter role"
					required
				/>

				<FormSubmit>
					<CirclePlus className="h-4 w-4" /> Create
				</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
