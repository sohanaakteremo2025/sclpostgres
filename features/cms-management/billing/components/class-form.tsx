import React from 'react'
import {
	FormProvider,
	FormInput,
	FormSubmit,
	FormRoot,
} from '@/components/school-form'
import {
	Class,
	CreateClassInput,
	CreateClassInputSchema,
	UpdateClassInput,
} from '@/lib/zod'
import { createClass, updateClass } from '../api/class.action'
import { CirclePlus } from 'lucide-react'

export default function ClassForm({
	onSuccess,
	item,
}: {
	onSuccess: () => void
	item?: Class
}) {
	return (
		<FormProvider
			schema={CreateClassInputSchema}
			defaultValues={item}
			onSubmit={async data => {
				try {
					if (item) {
						await updateClass(item.id, data as UpdateClassInput)
					} else {
						await createClass(data as CreateClassInput)
					}
					onSuccess()
					return {
						success: true,
						message: 'Class created successfully!',
					}
				} catch (error) {
					return {
						success: false,
						message:
							error instanceof Error ? error.message : 'Failed to create class',
					}
				}
			}}
		>
			<FormRoot className="">
				<FormInput
					name="name"
					label="Class Name"
					placeholder="Enter class name"
					required
				/>

				<FormSubmit>
					<CirclePlus className="h-4 w-4" /> Create
				</FormSubmit>
			</FormRoot>
		</FormProvider>
	)
}
