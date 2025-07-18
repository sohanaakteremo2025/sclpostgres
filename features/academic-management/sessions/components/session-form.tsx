import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormDatePicker,
	FormSelect,
} from '@/components/school-form'
import {
	AcademicSession,
	CreateAcademicSessionInput,
	CreateAcademicSessionInputSchema,
	SessionStatusSchema,
	UpdateAcademicSessionInput,
} from '@/lib/zod'
import { createSession, updateSession } from '../api/session.action'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'

export default function SessionForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: AcademicSession
}) {
	return (
		<FormProvider
			schema={CreateAcademicSessionInputSchema}
			defaultValues={item}
			onSubmit={async data => {
				try {
					if (item) {
						await updateSession(item.id, data as UpdateAcademicSessionInput)
					} else {
						await createSession(data as CreateAcademicSessionInput)
					}
					onSuccess()
					return {
						success: true,
						message: 'Session created successfully!',
					}
				} catch (error) {
					return {
						success: false,
						message:
							error instanceof Error
								? error.message
								: 'Failed to create session',
					}
				}
			}}
		>
			<FormRoot className="">
				<FormInput
					name="title"
					label="Session Title"
					placeholder="Enter session title"
					required
				/>

				<FormDatePicker name="startDate" label="Start Date" required />

				<FormDatePicker name="endDate" label="End Date" required />

				<FormSelect
					name="status"
					label="Status"
					required
					options={enumToOptions(SessionStatusSchema.enum)}
				/>

				<FormSubmit>{item ? 'Update' : 'Create'}</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
