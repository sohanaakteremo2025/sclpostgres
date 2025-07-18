'use client'

import { useEffect, useState } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

// Helper function to transform values based on Zod schema
function transformValuesUsingSchema<T extends Record<string, any>>(
	values: T,
	schema: z.ZodSchema<any>,
): T {
	try {
		// Get the schema shape to understand field types
		const schemaShape = getSchemaShape(schema)
		if (!schemaShape) return values

		const transformed = { ...values } as Record<string, any>

		for (const [key, fieldSchema] of Object.entries(schemaShape)) {
			const value = transformed[key]

			if (value !== undefined && value !== null) {
				// Check if this field should be a Date
				if (isDateSchema(fieldSchema) && typeof value === 'string') {
					const date = new Date(value)
					if (!isNaN(date.getTime())) {
						transformed[key] = date
					}
				}
			}
		}

		return transformed as T
	} catch (error) {
		console.warn('Failed to transform values using schema:', error)
		return values
	}
}

// Helper to extract schema shape
function getSchemaShape(schema: z.ZodSchema<any>): Record<string, any> | null {
	try {
		// Handle different Zod schema types
		if (schema instanceof z.ZodObject) {
			return schema.shape
		}

		// Handle ZodEffects (refined schemas)
		if (schema instanceof z.ZodEffects) {
			return getSchemaShape(schema._def.schema)
		}

		// Handle other wrapped schemas
		if ('_def' in schema && schema._def && typeof schema._def === 'object') {
			const def = schema._def as any
			if ('innerType' in def && def.innerType) {
				return getSchemaShape(def.innerType as z.ZodSchema<any>)
			}
		}

		return null
	} catch {
		return null
	}
}

// Helper to check if a schema field expects a Date
function isDateSchema(fieldSchema: any): boolean {
	try {
		// Direct ZodDate
		if (fieldSchema instanceof z.ZodDate) {
			return true
		}

		// ZodOptional wrapping ZodDate
		if (fieldSchema instanceof z.ZodOptional) {
			return isDateSchema(fieldSchema._def.innerType)
		}

		// ZodNullable wrapping ZodDate
		if (fieldSchema instanceof z.ZodNullable) {
			return isDateSchema(fieldSchema._def.innerType)
		}

		// ZodDefault wrapping ZodDate
		if (fieldSchema instanceof z.ZodDefault) {
			return isDateSchema(fieldSchema._def.innerType)
		}

		// ZodEffects (refined) wrapping ZodDate
		if (fieldSchema instanceof z.ZodEffects) {
			return isDateSchema(fieldSchema._def.schema)
		}

		return false
	} catch {
		return false
	}
}

interface UseFormDefaultsOptions<T extends FieldValues> {
	form: UseFormReturn<T>
	fetchDefaults?: () => Promise<Partial<T>>
	defaultValues?: Partial<T>
	enabled?: boolean
	schema?: z.ZodSchema<T> // Add schema parameter
}

interface UseFormDefaultsReturn {
	isLoading: boolean
	error: Error | null
}

export function useFormDefaults<T extends FieldValues>({
	form,
	fetchDefaults,
	defaultValues,
	enabled = true,
	schema,
}: UseFormDefaultsOptions<T>): UseFormDefaultsReturn {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!enabled) return

		const loadDefaults = async () => {
			try {
				setIsLoading(true)
				setError(null)

				let values: Partial<T> = {}

				if (defaultValues) {
					values = { ...defaultValues }
				}

				if (fetchDefaults) {
					const fetchedValues = await fetchDefaults()
					values = { ...values, ...fetchedValues }
				}

				if (Object.keys(values).length > 0) {
					// Transform values using Zod schema if provided
					const transformedValues = schema
						? transformValuesUsingSchema(values, schema)
						: values

					// Reset form with transformed values
					form.reset(transformedValues as T)

					// Trigger validation for all fields after reset
					// This will ensure isValid is properly set
					setTimeout(async () => {
						await form.trigger() // Trigger validation for all fields
					}, 0)
				}
			} catch (err) {
				setError(
					err instanceof Error ? err : new Error('Failed to load defaults'),
				)
			} finally {
				setIsLoading(false)
			}
		}

		loadDefaults()
	}, [form, fetchDefaults, defaultValues, enabled, schema])

	return { isLoading, error }
}
