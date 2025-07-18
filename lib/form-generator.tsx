import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

type ZodSchema = z.ZodObject<{
	[key: string]: z.ZodTypeAny
}>
// 🎯 UNIVERSAL FORM GENERATOR (Works with ANY Zod schema)
interface AutoFormProps<T extends z.ZodSchema> {
	schema: ZodSchema
	onSubmit: (data: z.infer<T>) => void | Promise<void>
	defaultValues?: Partial<z.infer<T>>
	submitText?: string
	className?: string
	fieldConfig?: FieldConfigMap
}

type FieldConfig = {
	type?:
		| 'input'
		| 'textarea'
		| 'select'
		| 'checkbox'
		| 'date'
		| 'number'
		| 'email'
		| 'password'
	placeholder?: string
	label?: string
	description?: string
	options?: Array<{ label: string; value: string }>
	hidden?: boolean
	disabled?: boolean
}

type FieldConfigMap = Record<string, FieldConfig>

export function AutoForm<T extends z.ZodSchema>({
	schema,
	onSubmit,
	defaultValues,
	submitText = 'Submit',
	className = 'space-y-4',
	fieldConfig = {},
}: AutoFormProps<T>) {
	const form = useForm<z.infer<T>>({
		resolver: zodResolver(schema),
		defaultValues: defaultValues as any,
	})

	// 🚀 AUTO-DETECT FIELD TYPES FROM ZOD SCHEMA
	const getFieldType = (
		fieldName: string,
		zodField: any,
	): FieldConfig['type'] => {
		const config = fieldConfig[fieldName]
		if (config?.type) return config.type

		// Smart type detection
		if (fieldName.includes('email')) return 'email'
		if (fieldName.includes('password')) return 'password'
		if (
			fieldName.includes('description') ||
			fieldName.includes('content') ||
			fieldName.includes('note')
		)
			return 'textarea'
		if (fieldName.includes('date') || fieldName.includes('Date')) return 'date'
		if (
			fieldName.includes('count') ||
			fieldName.includes('amount') ||
			fieldName.includes('price') ||
			fieldName.includes('marks')
		)
			return 'number'

		// Zod type detection
		if (zodField instanceof z.ZodString) return 'input'
		if (zodField instanceof z.ZodNumber) return 'number'
		if (zodField instanceof z.ZodBoolean) return 'checkbox'
		if (zodField instanceof z.ZodDate) return 'date'
		if (zodField instanceof z.ZodEnum) return 'select'
		if (zodField instanceof z.ZodOptional)
			return getFieldType(fieldName, zodField.unwrap())
		if (zodField instanceof z.ZodNullable)
			return getFieldType(fieldName, zodField.unwrap())

		return 'input'
	}

	// 🎯 GENERATE FORM FIELDS AUTOMATICALLY
	const renderField = (fieldName: string, zodField: any) => {
		const config = fieldConfig[fieldName] || {}
		const fieldType = getFieldType(fieldName, zodField)
		const label = config.label || formatLabel(fieldName)
		const placeholder = config.placeholder || `Enter ${label.toLowerCase()}`

		if (config.hidden) return null

		return (
			<FormField
				key={fieldName}
				control={form.control}
				name={fieldName as any}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							{renderInput(fieldType, field, config, zodField)}
						</FormControl>
						{config.description && (
							<p className="text-sm text-muted-foreground">
								{config.description}
							</p>
						)}
						<FormMessage />
					</FormItem>
				)}
			/>
		)
	}

	// 🎨 RENDER INPUT BASED ON TYPE
	const renderInput = (
		type: FieldConfig['type'],
		field: any,
		config: FieldConfig,
		zodField: any,
	) => {
		const commonProps = {
			...field,
			placeholder: config.placeholder,
			disabled: config.disabled,
		}

		switch (type) {
			case 'textarea':
				return <Textarea {...commonProps} rows={3} />

			case 'select':
				const options = config.options || getEnumOptions(zodField)
				return (
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<SelectTrigger>
							<SelectValue placeholder={config.placeholder || 'Select...'} />
						</SelectTrigger>
						<SelectContent>
							{options.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)

			case 'checkbox':
				return (
					<Checkbox
						checked={field.value}
						onCheckedChange={field.onChange}
						disabled={config.disabled}
					/>
				)

			case 'date':
				return (
					<Calendar
						mode="single"
						selected={field.value}
						onSelect={field.onChange}
						disabled={config.disabled}
					/>
				)

			case 'number':
				return (
					<Input
						{...commonProps}
						type="number"
						onChange={e =>
							field.onChange(e.target.value ? Number(e.target.value) : '')
						}
					/>
				)

			case 'email':
				return <Input {...commonProps} type="email" />

			case 'password':
				return <Input {...commonProps} type="password" />

			default:
				return <Input {...commonProps} />
		}
	}

	// 🔄 AUTO-GENERATE ALL FIELDS
	const fields = Object.keys(schema.shape)
		.map(fieldName => {
			const zodField = schema.shape[fieldName]
			return renderField(fieldName, zodField)
		})
		.filter(Boolean)

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={className}>
				{fields}
				<Button type="submit" className="w-full">
					{submitText}
				</Button>
			</form>
		</Form>
	)
}

// Helper functions
function formatLabel(fieldName: string): string {
	return fieldName
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, str => str.toUpperCase())
		.replace(/Id$/, ' ID')
}

function getEnumOptions(
	zodField: any,
): Array<{ label: string; value: string }> {
	if (zodField instanceof z.ZodEnum) {
		return zodField.options.map((value: string) => ({
			label: formatLabel(value),
			value,
		}))
	}
	if (zodField instanceof z.ZodOptional) {
		return getEnumOptions(zodField.unwrap())
	}
	return []
}
