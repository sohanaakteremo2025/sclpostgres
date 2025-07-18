// ======================
// CLEAN SCHEMA FORM SYSTEM - NO ANALYTICS
// ======================

// components/SchemaForm.tsx
import React, { useState, useCallback, useMemo } from 'react'
import { useForm, UseFormReturn, FieldPath } from 'react-hook-form'
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
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	ChevronLeft,
	ChevronRight,
	Check,
	AlertCircle,
	Loader2,
} from 'lucide-react'

// ======================
// TYPES & INTERFACES
// ======================

type ZodObjectSchema =
	| z.ZodObject<z.ZodRawShape, 'strip' | 'strict' | 'passthrough'>
	| z.ZodType<any, any, any>

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
		| 'file'
	placeholder?: string
	label?: string
	description?: string
	options?: Array<{ label: string; value: string; disabled?: boolean }>
	hidden?: boolean
	disabled?: boolean
	step?: number | string
	tab?: string
	section?: string
	required?: boolean
	className?: string
	helperText?: string

	// Conditional rendering
	conditional?: {
		field: string
		value: any
		operator?: 'equals' | 'not-equals' | 'in' | 'not-in'
	}

	// Callbacks
	onChange?: (value: any, form: UseFormReturn<any>) => void
	onBlur?: (value: any) => void

	// Styling
	size?: 'sm' | 'md' | 'lg'
}

type FieldConfigMap = Record<string, FieldConfig>

type FormStep = {
	id: string
	title: string
	description?: string
	fields: string[]
	optional?: boolean
	icon?: React.ReactNode
	onEnter?: () => Promise<void> | void
	onExit?: () => Promise<void> | void
}

type FormTab = {
	id: string
	title: string
	description?: string
	fields: string[]
	icon?: React.ReactNode
	badge?: string | number
	disabled?: boolean
}

interface SchemaFormProps<T extends ZodObjectSchema> {
	schema: T
	onSubmit: (data: z.infer<T>) => void | Promise<void>
	defaultValues?: Partial<z.infer<T>>
	submitText?: string
	className?: string
	fieldConfig?: FieldConfigMap

	// Layout options
	steps?: FormStep[]
	tabs?: FormTab[]
	layout?: 'single' | 'steps' | 'tabs'

	// Validation & UX
	validateOnStep?: boolean
	validateOnChange?: boolean
	showProgress?: boolean
	autoSave?: boolean
	autoSaveInterval?: number

	// State
	loading?: boolean
	disabled?: boolean
	readOnly?: boolean

	// Callbacks
	onStepChange?: (step: number, stepData: FormStep) => void
	onTabChange?: (tab: string, tabData: FormTab) => void
	onFieldChange?: (field: string, value: any) => void
	onError?: (errors: any) => void

	// Customization
	renderCustomField?: (
		fieldName: string,
		field: any,
		config: FieldConfig,
	) => React.ReactNode
	renderStepHeader?: (step: FormStep, currentStep: number) => React.ReactNode
	renderTabHeader?: (tab: FormTab, isActive: boolean) => React.ReactNode

	// Messages
	messages?: {
		next?: string
		previous?: string
		submit?: string
		loading?: string
		error?: string
		required?: string
		optional?: string
		step?: string
		of?: string
		complete?: string
	}
}

// ======================
// MAIN SCHEMA FORM COMPONENT
// ======================

export function FormBuilder<T extends ZodObjectSchema>({
	schema,
	onSubmit,
	defaultValues,
	submitText = 'Submit',
	className = 'space-y-4',
	fieldConfig = {},
	steps,
	tabs,
	layout = 'single',
	validateOnStep = true,
	validateOnChange = false,
	showProgress = true,
	autoSave = false,
	autoSaveInterval = 30000,
	loading = false,
	disabled = false,
	readOnly = false,
	onStepChange,
	onTabChange,
	onFieldChange,
	onError,
	renderCustomField,
	renderStepHeader,
	renderTabHeader,
	messages = {},
}: SchemaFormProps<T>) {
	// ✅ FIX: Proper type-safe field extraction
	const schemaShape = useMemo(() => {
		return (schema as any)._def?.shape?.() || (schema as any).shape || {}
	}, [schema])

	const allFields = useMemo(() => {
		return Object.keys(schemaShape)
	}, [schemaShape])

	// Form initialization
	const form = useForm<z.infer<T>>({
		resolver: zodResolver(schema),
		defaultValues: defaultValues as any,
		mode: validateOnChange
			? 'onChange'
			: validateOnStep
			? 'onBlur'
			: 'onSubmit',
		reValidateMode: 'onChange',
		shouldFocusError: true,
		shouldUnregister: false,
	})

	// State management
	const [currentStep, setCurrentStep] = useState(0)
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
	const [currentTab, setCurrentTab] = useState(tabs?.[0]?.id || '')
	const [isSubmitting, setIsSubmitting] = useState(false)
	// ✅ FIX: Proper state type for fieldErrors
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

	// Auto-save functionality
	React.useEffect(() => {
		if (!autoSave) return

		const interval = setInterval(() => {
			const formData = form.getValues()
			localStorage.setItem(`form-draft-${Date.now()}`, JSON.stringify(formData))
		}, autoSaveInterval)

		return () => clearInterval(interval)
	}, [autoSave, autoSaveInterval, form])

	// Load auto-saved data
	React.useEffect(() => {
		if (autoSave && !defaultValues) {
			const saved = localStorage.getItem(`form-draft-${Date.now()}`)
			if (saved) {
				try {
					const parsedData = JSON.parse(saved)
					form.reset(parsedData)
				} catch (error) {
					console.warn('Failed to load auto-saved form data:', error)
				}
			}
		}
	}, [autoSave, defaultValues, form])

	// Determine layout
	const effectiveLayout = steps ? 'steps' : tabs ? 'tabs' : layout

	// Field organization
	const organizedFields = useMemo(
		() => organizeFields(allFields, fieldConfig, steps, tabs),
		[allFields, fieldConfig, steps, tabs],
	)

	// Enhanced submit handler
	const handleSubmit = useCallback(
		async (data: z.infer<T>) => {
			setIsSubmitting(true)

			try {
				await onSubmit(data)

				// Clear auto-saved data on successful submit
				if (autoSave) {
					localStorage.removeItem(`form-draft-${Date.now()}`)
				}
			} catch (error) {
				onError?.(error)
				console.error('Form submission error:', error)
			} finally {
				setIsSubmitting(false)
			}
		},
		[onSubmit, autoSave, onError],
	)

	// Field change handler
	const handleFieldChange = useCallback(
		(fieldName: string, value: any) => {
			onFieldChange?.(fieldName, value)

			// ✅ FIX: Clear field error properly
			if (fieldErrors[fieldName]) {
				setFieldErrors(prev => {
					const newErrors = { ...prev }
					delete newErrors[fieldName]
					return newErrors
				})
			}
		},
		[onFieldChange, fieldErrors],
	)

	// Render based on layout
	switch (effectiveLayout) {
		case 'steps':
			return (
				<MultiStepForm
					form={form}
					schema={schema}
					schemaShape={schemaShape}
					onSubmit={handleSubmit}
					steps={organizedFields.steps || []}
					currentStep={currentStep}
					setCurrentStep={setCurrentStep}
					completedSteps={completedSteps}
					setCompletedSteps={setCompletedSteps}
					fieldConfig={fieldConfig}
					showProgress={showProgress}
					validateOnStep={validateOnStep}
					submitText={submitText}
					renderCustomField={renderCustomField}
					onStepChange={onStepChange}
					handleFieldChange={handleFieldChange}
					disabled={disabled}
					readOnly={readOnly}
					isSubmitting={isSubmitting}
					messages={messages}
				/>
			)

		case 'tabs':
			return (
				<MultiTabForm
					form={form}
					schema={schema}
					schemaShape={schemaShape}
					onSubmit={handleSubmit}
					tabs={organizedFields.tabs || []}
					currentTab={currentTab}
					setCurrentTab={setCurrentTab}
					fieldConfig={fieldConfig}
					submitText={submitText}
					renderCustomField={renderCustomField}
					onTabChange={onTabChange}
					handleFieldChange={handleFieldChange}
					disabled={disabled}
					readOnly={readOnly}
					isSubmitting={isSubmitting}
				/>
			)

		default:
			return (
				<SingleForm
					form={form}
					schema={schema}
					schemaShape={schemaShape}
					onSubmit={handleSubmit}
					fields={allFields}
					fieldConfig={fieldConfig}
					className={className}
					submitText={submitText}
					renderCustomField={renderCustomField}
					handleFieldChange={handleFieldChange}
					disabled={disabled}
					readOnly={readOnly}
					isSubmitting={isSubmitting}
				/>
			)
	}
}

// ======================
// SINGLE FORM LAYOUT
// ======================

function SingleForm<T extends ZodObjectSchema>({
	form,
	schema,
	schemaShape,
	onSubmit,
	fields,
	fieldConfig,
	className,
	submitText,
	renderCustomField,
	handleFieldChange,
	disabled,
	readOnly,
	isSubmitting,
}: {
	form: UseFormReturn<z.infer<T>>
	schema: T
	schemaShape: Record<string, any>
	onSubmit: (data: z.infer<T>) => void | Promise<void>
	fields: string[]
	fieldConfig: FieldConfigMap
	className: string
	submitText: string
	renderCustomField?: (
		fieldName: string,
		field: any,
		config: FieldConfig,
	) => React.ReactNode
	handleFieldChange: (field: string, value: any) => void
	disabled: boolean
	readOnly: boolean
	isSubmitting: boolean
}) {
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={className}>
				{fields.map(fieldName =>
					renderField(
						fieldName,
						form,
						fieldConfig,
						schemaShape,
						handleFieldChange,
						renderCustomField,
						disabled,
						readOnly,
					),
				)}
				<Button
					type="submit"
					className="w-full"
					disabled={disabled || isSubmitting}
				>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{submitText}
				</Button>
			</form>
		</Form>
	)
}

// ======================
// MULTI-STEP FORM LAYOUT
// ======================

function MultiStepForm<T extends ZodObjectSchema>({
	form,
	schema,
	schemaShape,
	onSubmit,
	steps,
	currentStep,
	setCurrentStep,
	completedSteps,
	setCompletedSteps,
	fieldConfig,
	showProgress,
	validateOnStep,
	submitText,
	renderCustomField,
	onStepChange,
	handleFieldChange,
	disabled,
	readOnly,
	isSubmitting,
	messages,
}: {
	form: UseFormReturn<z.infer<T>>
	schema: T
	schemaShape: Record<string, any>
	onSubmit: (data: z.infer<T>) => void | Promise<void>
	steps: FormStep[]
	currentStep: number
	setCurrentStep: (step: number) => void
	completedSteps: Set<number>
	setCompletedSteps: (steps: Set<number>) => void
	fieldConfig: FieldConfigMap
	showProgress: boolean
	validateOnStep: boolean
	submitText: string
	renderCustomField?: (
		fieldName: string,
		field: any,
		config: FieldConfig,
	) => React.ReactNode
	onStepChange?: (step: number, stepData: FormStep) => void
	handleFieldChange: (field: string, value: any) => void
	disabled: boolean
	readOnly: boolean
	isSubmitting: boolean
	messages: any
}) {
	const currentStepData = steps[currentStep]
	const isLastStep = currentStep === steps.length - 1

	const validateStep = async () => {
		if (!validateOnStep) return true

		const fieldsToValidate = currentStepData.fields
		const isValid = await form.trigger(fieldsToValidate as any)

		if (isValid) {
			setCompletedSteps(new Set([...completedSteps, currentStep]))
		}

		return isValid
	}

	const nextStep = async () => {
		const isValid = await validateStep()
		if (isValid && currentStep < steps.length - 1) {
			const newStep = currentStep + 1
			setCurrentStep(newStep)
			onStepChange?.(newStep, steps[newStep])
		}
	}

	const prevStep = () => {
		if (currentStep > 0) {
			const newStep = currentStep - 1
			setCurrentStep(newStep)
			onStepChange?.(newStep, steps[newStep])
		}
	}

	const handleFinalSubmit = async (data: z.infer<T>) => {
		const isValid = await validateStep()
		if (isValid) {
			onSubmit(data)
		}
	}

	return (
		<div className="space-y-6">
			{/* Progress Bar */}
			{showProgress && (
				<div className="space-y-2">
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>
							{messages.step || 'Step'} {currentStep + 1} {messages.of || 'of'}{' '}
							{steps.length}
						</span>
						<span>
							{Math.round(((currentStep + 1) / steps.length) * 100)}%{' '}
							{messages.complete || 'Complete'}
						</span>
					</div>
					<Progress
						value={((currentStep + 1) / steps.length) * 100}
						className="w-full"
					/>
				</div>
			)}

			{/* Step Indicators */}
			<div className="flex items-center justify-between">
				{steps.map((step, index) => (
					<div key={step.id} className="flex items-center">
						<div
							className={`
              min-w-8 min-h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${
								index <= currentStep
									? 'bg-blue-500 text-white'
									: 'bg-gray-200 text-gray-600'
							}
              ${completedSteps.has(index) ? 'bg-green-500' : ''}
            `}
						>
							{completedSteps.has(index) ? (
								<Check className="w-4 h-4" />
							) : (
								index + 1
							)}
						</div>
						<span className="ml-2 text-sm font-medium hidden sm:block">
							{step.title}
						</span>
						{index < steps.length - 1 && (
							<div className="w-full h-px bg-gray-200 mx-4" />
						)}
					</div>
				))}
			</div>

			{/* Current Step Content */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{currentStepData.icon}
						{currentStepData.title}
					</CardTitle>
					{currentStepData.description && (
						<p className="text-sm text-muted-foreground">
							{currentStepData.description}
						</p>
					)}
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleFinalSubmit)}
							className="space-y-4"
						>
							{currentStepData.fields.map(fieldName =>
								renderField(
									fieldName,
									form,
									fieldConfig,
									schemaShape,
									handleFieldChange,
									renderCustomField,
									disabled,
									readOnly,
								),
							)}

							{/* Navigation Buttons */}
							<div className="flex justify-between pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={prevStep}
									disabled={currentStep === 0 || disabled}
									className="flex items-center gap-2"
								>
									<ChevronLeft className="w-4 h-4" />
									{messages.previous || 'Previous'}
								</Button>

								{isLastStep ? (
									<Button
										type="submit"
										className="flex items-center gap-2"
										disabled={disabled || isSubmitting}
									>
										{isSubmitting && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										{submitText}
										<Check className="w-4 h-4" />
									</Button>
								) : (
									<Button
										type="button"
										onClick={nextStep}
										className="flex items-center gap-2"
										disabled={disabled}
									>
										{messages.next || 'Next'}
										<ChevronRight className="w-4 h-4" />
									</Button>
								)}
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}

// ======================
// MULTI-TAB FORM LAYOUT
// ======================

function MultiTabForm<T extends ZodObjectSchema>({
	form,
	schema,
	schemaShape,
	onSubmit,
	tabs,
	currentTab,
	setCurrentTab,
	fieldConfig,
	submitText,
	renderCustomField,
	onTabChange,
	handleFieldChange,
	disabled,
	readOnly,
	isSubmitting,
}: {
	form: UseFormReturn<z.infer<T>>
	schema: T
	schemaShape: Record<string, any>
	onSubmit: (data: z.infer<T>) => void | Promise<void>
	tabs: FormTab[]
	currentTab: string
	setCurrentTab: (tab: string) => void
	fieldConfig: FieldConfigMap
	submitText: string
	renderCustomField?: (
		fieldName: string,
		field: any,
		config: FieldConfig,
	) => React.ReactNode
	onTabChange?: (tab: string, tabData: FormTab) => void
	handleFieldChange: (field: string, value: any) => void
	disabled: boolean
	readOnly: boolean
	isSubmitting: boolean
}) {
	const handleTabChange = (tabId: string) => {
		setCurrentTab(tabId)
		const tabData = tabs.find(tab => tab.id === tabId)
		if (tabData) {
			onTabChange?.(tabId, tabData)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<Tabs value={currentTab} onValueChange={handleTabChange}>
					<TabsList
						className="grid w-full"
						style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
					>
						{tabs.map(tab => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className="flex items-center gap-2"
								disabled={tab.disabled || disabled}
							>
								{tab.icon}
								{tab.title}
								{tab.badge && (
									<Badge variant="secondary" className="ml-1 text-xs">
										{tab.badge}
									</Badge>
								)}
							</TabsTrigger>
						))}
					</TabsList>

					{tabs.map(tab => (
						<TabsContent key={tab.id} value={tab.id} className="space-y-4">
							<div className="space-y-4">
								{tab.description && (
									<p className="text-sm text-muted-foreground">
										{tab.description}
									</p>
								)}

								{tab.fields.map(fieldName =>
									renderField(
										fieldName,
										form,
										fieldConfig,
										schemaShape,
										handleFieldChange,
										renderCustomField,
										disabled,
										readOnly,
									),
								)}
							</div>
						</TabsContent>
					))}
				</Tabs>

				<Button
					type="submit"
					className="w-full"
					disabled={disabled || isSubmitting}
				>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{submitText}
				</Button>
			</form>
		</Form>
	)
}

// ======================
// FIELD RENDERING LOGIC
// ======================

function renderField<T extends ZodObjectSchema>(
	fieldName: string,
	form: UseFormReturn<z.infer<T>>,
	fieldConfig: FieldConfigMap,
	schemaShape: Record<string, any>,
	handleFieldChange: (field: string, value: any) => void,
	renderCustomField?: (
		fieldName: string,
		field: any,
		config: FieldConfig,
	) => React.ReactNode,
	disabled = false,
	readOnly = false,
) {
	const config = fieldConfig[fieldName] || {}
	const zodField = schemaShape[fieldName]

	if (config.hidden) return null

	// Check conditional rendering
	if (config.conditional) {
		const conditionField = form.watch(
			config.conditional.field as FieldPath<z.infer<T>>,
		)
		const shouldShow = evaluateCondition(
			conditionField,
			config.conditional.value,
			config.conditional.operator,
		)
		if (!shouldShow) return null
	}

	// Custom field renderer takes priority
	if (renderCustomField) {
		const customField = renderCustomField(fieldName, zodField, config)
		if (customField) return customField
	}

	const fieldType = getFieldType(fieldName, zodField, config)
	const label = config.label || formatLabel(fieldName)
	const placeholder = config.placeholder || `Enter ${label.toLowerCase()}`
	const isDisabled = disabled || config.disabled
	const isReadOnly = readOnly

	return (
		<FormField
			key={fieldName}
			control={form.control}
			name={fieldName as FieldPath<z.infer<T>>}
			render={({ field, fieldState }) => (
				<FormItem className={config.className}>
					<FormLabel className="flex items-center justify-between">
						<span className="flex items-center gap-2">
							{label}
							{config.required && (
								<Badge variant="destructive" className="text-xs px-1 py-0">
									Required
								</Badge>
							)}
						</span>
						{config.helperText && (
							<span className="text-xs text-muted-foreground font-normal">
								{config.helperText}
							</span>
						)}
					</FormLabel>

					<FormControl>
						{renderInput(
							fieldType,
							{
								...field,
								onChange: (value: any) => {
									field.onChange(value)
									handleFieldChange(fieldName, value)
									config.onChange?.(value, form)
								},
								onBlur: (e: any) => {
									field.onBlur()
									config.onBlur?.(e.target?.value || e)
								},
							},
							config,
							zodField,
							isDisabled,
							isReadOnly,
						)}
					</FormControl>

					{config.description && (
						<p className="text-sm text-muted-foreground">
							{config.description}
						</p>
					)}

					<FormMessage />

					{/* Field-level error display */}
					{fieldState.error && (
						<Alert variant="destructive" className="mt-2">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="text-sm">
								{fieldState.error.message}
							</AlertDescription>
						</Alert>
					)}
				</FormItem>
			)}
		/>
	)
}

// ======================
// INPUT RENDERING
// ======================

function renderInput(
	type: FieldConfig['type'],
	field: any,
	config: FieldConfig,
	zodField: any,
	disabled = false,
	readOnly = false,
) {
	const commonProps = {
		...field,
		placeholder: config.placeholder,
		disabled: disabled,
		readOnly: readOnly,
		className: `${
			config.size === 'sm' ? 'h-8' : config.size === 'lg' ? 'h-12' : 'h-10'
		}`,
	}

	switch (type) {
		case 'textarea':
			return (
				<Textarea
					{...commonProps}
					rows={3}
					className={`resize-none ${commonProps.className}`}
				/>
			)

		case 'select':
			const options = config.options || getEnumOptions(zodField)
			return (
				<Select
					onValueChange={field.onChange}
					value={field.value}
					disabled={disabled}
				>
					<SelectTrigger className={commonProps.className}>
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
				<div className="flex items-center space-x-2">
					<Checkbox
						checked={field.value || false}
						onCheckedChange={field.onChange}
						disabled={disabled}
						id={field.name}
					/>
					<label htmlFor={field.name} className="text-sm font-medium">
						{config.label || formatLabel(field.name)}
					</label>
				</div>
			)

		case 'date':
			return (
				<DatePicker
					value={field.value}
					onChange={field.onChange}
					disabled={disabled}
				/>
			)

		case 'number':
			return (
				<Input
					{...commonProps}
					type="number"
					onChange={e =>
						field.onChange(e.target.value ? Number(e.target.value) : undefined)
					}
					value={field.value || ''}
				/>
			)

		case 'email':
			return <Input {...commonProps} type="email" />

		case 'password':
			return <Input {...commonProps} type="password" />

		case 'file':
			return (
				<Input
					{...commonProps}
					type="file"
					onChange={e => field.onChange(e.target.files?.[0])}
					value={undefined}
				/>
			)

		default:
			return <Input {...commonProps} />
	}
}

// ======================
// HELPER FUNCTIONS
// ======================

function getFieldType(
	fieldName: string,
	zodField: any,
	config: FieldConfig,
): FieldConfig['type'] {
	if (config.type) return config.type

	const fieldLower = fieldName.toLowerCase()
	if (fieldLower.includes('email')) return 'email'
	if (fieldLower.includes('password')) return 'password'
	if (
		fieldLower.includes('description') ||
		fieldLower.includes('content') ||
		fieldLower.includes('note')
	)
		return 'textarea'
	if (fieldLower.includes('date') || fieldLower.endsWith('at')) return 'date'
	if (
		fieldLower.includes('count') ||
		fieldLower.includes('amount') ||
		fieldLower.includes('price') ||
		fieldLower.includes('marks')
	)
		return 'number'

	if (!zodField) return 'input'

	const zodType = zodField._def?.typeName || zodField.constructor?.name

	switch (zodType) {
		case 'ZodString':
			return 'input'
		case 'ZodNumber':
			return 'number'
		case 'ZodBoolean':
			return 'checkbox'
		case 'ZodDate':
			return 'date'
		case 'ZodEnum':
			return 'select'
		case 'ZodNativeEnum':
			return 'select'
		case 'ZodOptional':
			return getFieldType(fieldName, zodField._def.innerType, config)
		case 'ZodNullable':
			return getFieldType(fieldName, zodField._def.innerType, config)
		default:
			return 'input'
	}
}

function formatLabel(fieldName: string): string {
	return fieldName
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, str => str.toUpperCase())
		.replace(/Id$/, ' ID')
}

function getEnumOptions(
	zodField: any,
): Array<{ label: string; value: string }> {
	if (!zodField) return []

	// Handle ZodEnum
	if (zodField._def?.values) {
		return zodField._def.values.map((value: string) => ({
			label: formatLabel(value.replace(/_/g, ' ')),
			value,
		}))
	}

	// Handle ZodNativeEnum
	if (zodField._def?.values && typeof zodField._def.values === 'object') {
		return Object.entries(zodField._def.values).map(([key, value]) => ({
			label: formatLabel(key.replace(/_/g, ' ')),
			value: value as string,
		}))
	}

	// Handle wrapped enums (optional, nullable)
	if (zodField._def?.innerType) {
		return getEnumOptions(zodField._def.innerType)
	}

	return []
}

function evaluateCondition(
	fieldValue: any,
	expectedValue: any,
	operator = 'equals',
): boolean {
	switch (operator) {
		case 'equals':
			return fieldValue === expectedValue
		case 'not-equals':
			return fieldValue !== expectedValue
		case 'in':
			return Array.isArray(expectedValue) && expectedValue.includes(fieldValue)
		case 'not-in':
			return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue)
		default:
			return fieldValue === expectedValue
	}
}

function organizeFields(
	allFields: string[],
	fieldConfig: FieldConfigMap,
	steps?: FormStep[],
	tabs?: FormTab[],
): { steps?: FormStep[]; tabs?: FormTab[]; fields: string[] } {
	if (steps) return { steps, fields: allFields }
	if (tabs) return { tabs, fields: allFields }

	// Auto-organize based on field config
	const stepFields: Record<string, string[]> = {}
	const tabFields: Record<string, string[]> = {}

	allFields.forEach(field => {
		const config = fieldConfig[field]

		if (config?.step !== undefined) {
			const stepKey = config.step.toString()
			if (!stepFields[stepKey]) stepFields[stepKey] = []
			stepFields[stepKey].push(field)
		}

		if (config?.tab) {
			if (!tabFields[config.tab]) tabFields[config.tab] = []
			tabFields[config.tab].push(field)
		}
	})

	if (Object.keys(stepFields).length > 0) {
		const generatedSteps = Object.entries(stepFields)
			.sort(([a], [b]) => Number(a) - Number(b))
			.map(([step, fields]) => ({
				id: step,
				title: `Step ${step}`,
				fields,
			}))
		return { steps: generatedSteps, fields: allFields }
	}

	if (Object.keys(tabFields).length > 0) {
		const generatedTabs = Object.entries(tabFields).map(([tab, fields]) => ({
			id: tab,
			title: tab,
			fields,
		}))
		return { tabs: generatedTabs, fields: allFields }
	}

	return { fields: allFields }
}

// Export the main component
export default FormBuilder

// ======================
// USAGE EXAMPLES
// ======================

/*
// 1. BASIC SINGLE FORM
<FormBuilder 
  schema={StudentCreateInputSchema}
  onSubmit={handleSubmit}
  submitText="Create Student"
  fieldConfig={{
    id: { hidden: true },
    tenantId: { hidden: true },
    createdAt: { hidden: true },
    updatedAt: { hidden: true },
    email: { type: 'email', required: true },
    address: { type: 'textarea' },
    gender: { 
      type: 'select',
      options: [
        { label: 'Male', value: 'MALE' },
        { label: 'Female', value: 'FEMALE' },
        { label: 'Other', value: 'OTHER' }
      ]
    }
  }}
  defaultValues={{
    tenantId: getCurrentTenantId(),
    status: 'ACTIVE'
  }}
/>

// 2. MULTI-STEP FORM
<FormBuilder 
  schema={StudentCreateInputSchema}
  onSubmit={handleSubmit}
  layout="steps"
  steps={[
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details',
      fields: ['name', 'email', 'phone', 'dateOfBirth', 'gender']
    },
    {
      id: 'academic',
      title: 'Academic Information',
      description: 'School and class details',
      fields: ['studentId', 'roll', 'sessionId', 'sectionId']
    },
    {
      id: 'family',
      title: 'Family Information',
      description: 'Parent and guardian details',
      fields: ['fatherName', 'motherName', 'guardianPhone', 'address']
    }
  ]}
  showProgress={true}
  validateOnStep={true}
  fieldConfig={{
    // Field configurations...
  }}
/>

// 3. MULTI-TAB FORM
<FormBuilder 
  schema={EmployeeCreateInputSchema}
  onSubmit={handleSubmit}
  layout="tabs"
  tabs={[
    {
      id: 'personal',
      title: 'Personal',
      icon: <User className="w-4 h-4" />,
      fields: ['name', 'email', 'phone', 'dateOfBirth']
    },
    {
      id: 'work',
      title: 'Work Details',
      icon: <Briefcase className="w-4 h-4" />,
      fields: ['designation', 'nationalId', 'joiningDate']
    },
    {
      id: 'contact',
      title: 'Contact',
      icon: <MapPin className="w-4 h-4" />,
      fields: ['address', 'emergencyContact']
    }
  ]}
/>

// 4. AUTO-ORGANIZED FORM
<FormBuilder 
  schema={ExamCreateInputSchema}
  onSubmit={handleSubmit}
  fieldConfig={{
    // Auto-organize into steps by adding step numbers
    title: { step: 1, required: true },
    examType: { step: 1, type: 'select' },
    sessionId: { step: 2 },
    totalMarks: { step: 2, type: 'number' },
    startDate: { step: 3, type: 'date' },
    endDate: { step: 3, type: 'date' },
    
    // Hidden system fields
    id: { hidden: true },
    tenantId: { hidden: true },
    createdAt: { hidden: true },
    updatedAt: { hidden: true }
  }}
  showProgress={true}
  validateOnStep={true}
/>

// 5. CONDITIONAL FIELDS
<FormBuilder 
  schema={UserCreateInputSchema}
  onSubmit={handleSubmit}
  fieldConfig={{
    userType: {
      type: 'select',
      options: [
        { label: 'Student', value: 'STUDENT' },
        { label: 'Teacher', value: 'TEACHER' },
        { label: 'Admin', value: 'ADMIN' }
      ]
    },
    studentId: {
      conditional: {
        field: 'userType',
        value: 'STUDENT',
        operator: 'equals'
      }
    },
    teacherCode: {
      conditional: {
        field: 'userType',
        value: 'TEACHER',
        operator: 'equals'
      }
    },
    adminLevel: {
      type: 'select',
      conditional: {
        field: 'userType',
        value: 'ADMIN',
        operator: 'equals'
      },
      options: [
        { label: 'Low', value: 'LOW' },
        { label: 'High', value: 'HIGH' }
      ]
    }
  }}
/>

// 6. CUSTOM FIELD RENDERING
<FormBuilder 
  schema={StudentCreateInputSchema}
  onSubmit={handleSubmit}
  renderCustomField={(fieldName, zodField, config) => {
    if (fieldName === 'photo') {
      return <ImageUploader key={fieldName} {...config} />
    }
    if (fieldName === 'sectionId') {
      return <AsyncSelect key={fieldName} loadOptions={loadSections} {...config} />
    }
    if (fieldName === 'signature') {
      return <SignaturePad key={fieldName} {...config} />
    }
    return null // Use default rendering
  }}
/>
*/
