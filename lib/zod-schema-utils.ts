import * as z from 'zod'

type ZodSchemaOptions<T extends z.ZodObject<any>> = {
	/** Fields that should always be required (overrides defaults) */
	requiredFields?: (keyof T['shape'])[]
	/** Fields that should always be optional (overrides defaults) */
	optionalFields?: (keyof T['shape'])[]
	/** Fields that should be excluded from create operations */
	createExclude?: (keyof T['shape'])[]
	/** Fields that should be excluded from update operations */
	updateExclude?: (keyof T['shape'])[]
	/** Custom validation for specific fields */
	customValidation?: Partial<{
		[K in keyof T['shape']]: z.ZodTypeAny
	}>
	/** Transform function to be applied to values after validation */
	transform?: (data: z.infer<T>) => any
	/** Additional constraints for specific operations */
	constraints?: {
		/** Additional constraints for create operation */
		create?: (schema: T) => z.ZodType<any>
		/** Additional constraints for update operation */
		update?: (schema: T) => z.ZodType<any>
	}
	/** Default values for fields */
	defaultValues?: Partial<z.infer<T>>
	/** Refine the entire schema with custom validation logic */
	refine?: {
		/** Validation function */
		check: (data: z.infer<T>) => boolean | Promise<boolean>
		/** Error message */
		message: string
		/** Path to the field that has the error */
		path?: (string | number)[]
	}[]
}

type SchemaResult<T extends z.ZodObject<any>> = {
	createSchema: z.ZodType<z.infer<T>>
	updateSchema: z.ZodType<Partial<z.infer<T>>>
}

/**
 * Creates form schemas from Zod Prisma generated base models with enterprise-level
 * features for robust form validation and data handling.
 */
export const createFormSchemas = <T extends z.ZodObject<any>>(
	baseSchema: T,
	options?: ZodSchemaOptions<T>,
): SchemaResult<T> => {
	// Merge defaults with provided options
	const opts: Required<ZodSchemaOptions<T>> = {
		requiredFields: [],
		optionalFields: [],
		createExclude: ['id', 'createdAt', 'updatedAt'] as any,
		updateExclude: ['createdAt', 'updatedAt'] as any,
		customValidation: {},
		transform: (data: any) => data,
		constraints: {},
		defaultValues: {},
		refine: [],
		...options,
	}

	// Helper for deep cloning object shapes to avoid mutation issues
	const deepCloneShape = (shape: z.ZodRawShape): z.ZodRawShape => {
		return Object.entries(shape).reduce((acc, [key, value]) => {
			acc[key] = value
			return acc
		}, {} as z.ZodRawShape)
	}

	// Helper to apply custom field validation
	const applyCustomValidation = (
		schema: z.ZodObject<any>,
	): z.ZodObject<any> => {
		const newShape = { ...schema.shape }
		for (const [field, validator] of Object.entries(opts.customValidation)) {
			if (field in newShape) {
				newShape[field] = validator
			}
		}
		return z.object(newShape)
	}

	// Helper to apply refinements to the schema
	const applyRefinements = <S extends z.ZodType<any>>(schema: S): S => {
		let result = schema

		for (const { check, message, path } of opts.refine) {
			if (path) {
				result = result.superRefine((data, ctx) => {
					const valid = check(data)
					if (!valid) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message,
							path,
						})
					}
				}) as unknown as S
			} else {
				result = result.refine(check, message) as unknown as S
			}
		}

		return result
	}

	// Helper to apply constraints to the schema
	const applyConstraints = <S extends z.ZodType<any>>(
		schema: S,
		mode: 'create' | 'update',
	): S => {
		const constraint =
			mode === 'create' ? opts.constraints.create : opts.constraints.update
		if (constraint) {
			return constraint(schema as unknown as T) as unknown as S
		}
		return schema
	}

	// Helper to apply transforms
	const applyTransform = <S extends z.ZodType<any>>(schema: S): S => {
		return schema.transform(opts.transform) as unknown as S
	}

	// Create deep clones of the base schema shape
	const createShape = deepCloneShape(baseSchema.shape)
	const updateShape = deepCloneShape(baseSchema.shape)

	// Apply exclusions
	for (const field of opts.createExclude) {
		if (field in createShape) {
			delete createShape[field as string]
		}
	}

	for (const field of opts.updateExclude) {
		if (field in updateShape) {
			delete updateShape[field as string]
		}
	}

	// Helper to process field requirements
	const processField = (
		shape: z.ZodRawShape,
		field: string,
		isRequired: boolean,
		isOptional: boolean,
		isUpdate: boolean = false,
	) => {
		if (field in shape) {
			const fieldSchema = shape[field]

			// Apply default values if specified
			if (opts.defaultValues && field in opts.defaultValues) {
				shape[field] = fieldSchema.default(
					opts.defaultValues[field as keyof typeof opts.defaultValues],
				)
			}

			// Handle required fields
			if (isRequired) {
				if (
					fieldSchema instanceof z.ZodNullable ||
					fieldSchema instanceof z.ZodOptional
				) {
					shape[field] = fieldSchema
						.unwrap()
						.refine((val: any) => val !== undefined && val !== null, {
							message: `${field} is required`,
						})
				}
			}
			// Handle optional fields
			else if (isOptional || (isUpdate && field !== 'id')) {
				if (!(fieldSchema instanceof z.ZodOptional)) {
					shape[field] = fieldSchema.optional()
				}
			}
		}
	}

	// Process create schema fields
	for (const field in createShape) {
		const isRequired = opts.requiredFields.includes(field as any)
		const isOptional = opts.optionalFields.includes(field as any)
		processField(createShape, field, isRequired, isOptional)
	}

	// Process update schema fields
	for (const field in updateShape) {
		const isRequired =
			field === 'id' || opts.requiredFields.includes(field as any)
		const isOptional = opts.optionalFields.includes(field as any)
		processField(updateShape, field, isRequired, isOptional, true)
	}

	// Create the basic schemas
	let createSchema = z.object(createShape) as unknown as T
	let updateSchema = z.object(updateShape) as unknown as T

	// Apply custom field validation
	createSchema = applyCustomValidation(createSchema) as unknown as T
	updateSchema = applyCustomValidation(updateSchema) as unknown as T

	// Apply refinements
	createSchema = applyRefinements(createSchema)
	updateSchema = applyRefinements(updateSchema)

	// Apply constraints
	createSchema = applyConstraints(createSchema, 'create')
	updateSchema = applyConstraints(updateSchema, 'update')

	// Apply transforms
	createSchema = applyTransform(createSchema)
	updateSchema = applyTransform(updateSchema)

	// Return the completed schemas
	return {
		createSchema,
		updateSchema,
	}
}
