import { useEffect } from 'react'
import { FieldValues, Path, PathValue, UseFormSetValue } from 'react-hook-form'
import {
	useFormContext,
	useMultiStepFormContext,
} from '../contexts/form-context'

// Single field watcher (existing functionality)
interface SingleFieldWatcherProps<
	TFieldValues extends FieldValues,
	TFieldName extends Path<TFieldValues>,
> {
	fieldName: TFieldName
	fieldNames?: never
	isMultiStepForm?: boolean
	onChange: (
		value: PathValue<TFieldValues, TFieldName>,
		setValue: UseFormSetValue<TFieldValues>,
		getValues: () => TFieldValues,
	) => void
	condition?: (value: PathValue<TFieldValues, TFieldName>) => boolean
}

// Multi-field watcher (new functionality)
interface MultiFieldWatcherProps<TFieldValues extends FieldValues> {
	fieldName?: never
	fieldNames: Path<TFieldValues>[]
	isMultiStepForm?: boolean
	onChange: (
		values: Partial<TFieldValues>,
		setValue: UseFormSetValue<TFieldValues>,
		getValues: () => TFieldValues,
	) => void
	condition?: (values: Partial<TFieldValues>) => boolean
}

type FormFieldWatcherProps<TFieldValues extends FieldValues> =
	| SingleFieldWatcherProps<TFieldValues, Path<TFieldValues>>
	| MultiFieldWatcherProps<TFieldValues>

export function FormFieldWatcher<TFieldValues extends FieldValues>({
	fieldName,
	fieldNames,
	isMultiStepForm = true,
	onChange,
	condition,
}: FormFieldWatcherProps<TFieldValues>) {
	const { form } = isMultiStepForm
		? useMultiStepFormContext<TFieldValues>()
		: useFormContext<TFieldValues>()

	// Single field watching (existing functionality)
	const singleWatchedValue = fieldName ? form.watch(fieldName) : undefined

	// Multi-field watching (new functionality)
	const multiWatchedValues = fieldNames ? form.watch(fieldNames) : undefined

	useEffect(() => {
		if (fieldName && singleWatchedValue !== undefined) {
			// Single field logic (existing)
			const shouldTrigger = condition
				? condition(singleWatchedValue)
				: !!singleWatchedValue

			if (shouldTrigger) {
				;(onChange as (value: any, setValue: any, getValues: any) => void)(
					singleWatchedValue,
					form.setValue,
					form.getValues,
				)
			}
		} else if (fieldNames && multiWatchedValues) {
			// Multi-field logic (new)
			const valuesObject = fieldNames.reduce((acc, fieldName, index) => {
				acc[fieldName] = multiWatchedValues[index]
				return acc
			}, {} as Partial<TFieldValues>)

			const shouldTrigger = condition
				? condition(valuesObject)
				: Object.values(valuesObject).some(value => !!value)

			if (shouldTrigger) {
				// Use a timeout to prevent infinite loops
				const timeoutId = setTimeout(() => {
					;(onChange as (values: any, setValue: any, getValues: any) => void)(
						valuesObject,
						form.setValue,
						form.getValues,
					)
				}, 0)

				return () => clearTimeout(timeoutId)
			}
		}
	}, [
		singleWatchedValue,
		multiWatchedValues,
		onChange,
		condition,
		fieldName,
		fieldNames,
		form.setValue,
		form.getValues,
	])

	return null // This component doesn't render anything
}
