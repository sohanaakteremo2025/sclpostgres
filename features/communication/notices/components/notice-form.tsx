import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
	FormDatePicker,
	FormSelect,
	FormTextarea,
} from '@/components/school-form'
import {
	Notice,
	CreateNoticeInput,
	CreateNoticeInputSchema,
	UpdateNoticeInput,
} from '@/lib/zod'
import { createNotice, updateNotice } from '../api/notice.action'
import { enumToOptions } from '@/components/prisma-data-table/utils/enum-to-options'

export default function NoticeForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: Notice
}) {
	return (
		<FormProvider
			schema={CreateNoticeInputSchema}
			defaultValues={item}
			onSubmit={async data => {
				try {
					if (item) {
						await updateNotice(item.id, data as UpdateNoticeInput)
					} else {
						await createNotice(data as CreateNoticeInput)
					}
					onSuccess()
					return {
						success: true,
						message: 'Notice created successfully!',
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
				<FormTextarea
					name="content"
					label="Session Content"
					placeholder="Enter session content"
					required
				/>

				<FormSubmit>{item ? 'Update' : 'Create'}</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
