'use client'

import { useEffect, useState, useMemo } from 'react'
import { FieldValues, FieldPath, useWatch } from 'react-hook-form'
import { useFormContext } from '../contexts/form-context'
import { SelectOption } from '../types/form'

interface UseCascadeSelectOptions<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
> {
	name: TName
	dependsOn?: FieldPath<TFieldValues>
	options: SelectOption[] | ((dependentValue: any) => Promise<SelectOption[]>)
	enabled?: boolean
}

interface UseCascadeSelectReturn {
	options: SelectOption[]
	isLoading: boolean
	error: Error | null
}

export function useCascadeSelect<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
>({
	name,
	dependsOn,
	options,
	enabled = true,
}: UseCascadeSelectOptions<TFieldValues, TName>): UseCascadeSelectReturn {
	const { form } = useFormContext<TFieldValues>()
	const [selectOptions, setSelectOptions] = useState<SelectOption[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	// Watch the dependent field value
	// Watch the dependent field value only if dependsOn is provided
	const dependentValue = dependsOn
		? useWatch({
				control: form.control,
				name: dependsOn,
			})
		: undefined

	// Memoize static options
	const staticOptions = useMemo(() => {
		return Array.isArray(options) ? options : []
	}, [options])

	useEffect(() => {
		if (!enabled) return

		const loadOptions = async () => {
			try {
				setIsLoading(true)
				setError(null)

				if (Array.isArray(options)) {
					setSelectOptions(options)
				} else {
					// Dynamic options based on dependent value
					if (dependsOn && !dependentValue) {
						setSelectOptions([])
						return
					}

					const dynamicOptions = await options(dependentValue)
					setSelectOptions(dynamicOptions)
				}
			} catch (err) {
				setError(
					err instanceof Error ? err : new Error('Failed to load options'),
				)
				setSelectOptions([])
			} finally {
				setIsLoading(false)
			}
		}

		loadOptions()
	}, [options, dependentValue, dependsOn, enabled])

	// Clear current field value when dependent value changes
	useEffect(() => {
		if (dependsOn && dependentValue !== undefined) {
			const currentValue = form.getValues(name)
			if (currentValue && currentValue !== '') {
				form.setValue(name, '' as any)
			}
		}
	}, [dependentValue, dependsOn, form, name])

	return {
		options: Array.isArray(options) ? staticOptions : selectOptions,
		isLoading,
		error,
	}
}
