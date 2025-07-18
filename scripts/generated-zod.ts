// scripts/generate-zod.ts
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

// Ensure lib/zod directory exists
try {
	mkdirSync('lib/zod', { recursive: true })
} catch (error) {
	// Directory might already exist
}

const schemaContent = readFileSync('prisma/schema.prisma', 'utf8')

// Fields that should be excluded from input operations (auto-managed)
const INPUT_EXCLUDED_FIELDS = new Set([
	'id',
	'createdAt',
	'updatedAt',
	'createdBy',
	'updatedBy',
])

// tenantId handling - omit from input but include in payload
const TENANT_FIELD = 'tenantId'

function generateZodSchemas(content: string) {
	const models = content.match(/model\s+(\w+)\s*{[^}]*}/g) || []

	let output = `import { z } from 'zod'\nimport { Decimal } from 'decimal.js'\n\n`
	output += `export const DecimalSchema = z.union([z.instanceof(Decimal), z.string(), z.number()]).transform(val => new Decimal(val))\n\n`

	models.forEach(modelMatch => {
		const nameMatch = modelMatch.match(/model\s+(\w+)/)
		if (!nameMatch) return

		const modelName = nameMatch[1]
		const modelBody = modelMatch.match(/{([^}]*)}/)?.[1] || ''

		// Parse fields more carefully
		const fieldLines = modelBody
			.split('\n')
			.map(line => line.trim())
			.filter(line => {
				return (
					line &&
					!line.startsWith('//') &&
					!line.startsWith('@@') &&
					!line.includes('relation(') &&
					line.includes(' ') &&
					!line.startsWith('}') &&
					!line.startsWith('{')
				)
			})

		const fields: Array<{
			name: string
			type: string
			isOptional: boolean
			isArray: boolean
			zodType: string
		}> = []

		fieldLines.forEach(line => {
			// Match: fieldName Type[]? @attributes
			const fieldMatch = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?/)
			if (!fieldMatch) return

			const [, fieldName, fieldType, arrayMarker, optional] = fieldMatch

			// Skip relation fields (uppercase custom types)
			if (
				fieldType[0] === fieldType[0].toUpperCase() &&
				!['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Decimal'].includes(
					fieldType,
				)
			) {
				return
			}

			let zodType = 'z.string()'

			switch (fieldType) {
				case 'String':
					zodType = 'z.string()'
					break
				case 'Int':
					zodType = 'z.number().int()'
					break
				case 'Float':
					zodType = 'z.number()'
					break
				case 'Boolean':
					zodType = 'z.boolean()'
					break
				case 'DateTime':
					zodType = 'z.date()'
					break
				case 'Decimal':
					zodType = 'DecimalSchema'
					break
				default:
					zodType = 'z.string()'
			}

			// Handle arrays
			if (arrayMarker) {
				zodType = `z.array(${zodType})`
			}

			fields.push({
				name: fieldName,
				type: fieldType,
				isOptional: !!optional,
				isArray: !!arrayMarker,
				zodType,
			})
		})

		// Check if model has tenantId
		const hasTenantId = fields.some(field => field.name === TENANT_FIELD)
		const hasIdField = fields.some(field => field.name === 'id')

		// Generate base schema
		output += `export const ${modelName}Schema = z.object({\n`
		fields.forEach(field => {
			let fieldZodType = field.zodType
			if (field.isOptional) {
				fieldZodType += '.optional()'
			}
			output += `  ${field.name}: ${fieldZodType},\n`
		})
		output += `})\n\n`
		output += `export type ${modelName} = z.infer<typeof ${modelName}Schema>\n\n`

		// Generate Input schema using omit (cleaner approach)
		// Only omit fields that actually exist in the model
		const potentialOmitFields = [
			'id',
			'createdAt',
			'updatedAt',
			'createdBy',
			'updatedBy',
		]
		if (hasTenantId) {
			potentialOmitFields.push(TENANT_FIELD)
		}

		// Filter to only include fields that exist in the model
		const omitFields = potentialOmitFields.filter(fieldName =>
			fields.some(field => field.name === fieldName),
		)

		output += `export const ${modelName}InputSchema = ${modelName}Schema.omit({\n`
		omitFields.forEach(field => {
			output += `  ${field}: true,\n`
		})
		output += `})\n\n`
		output += `export type ${modelName}Input = z.infer<typeof ${modelName}InputSchema>\n\n`

		// Generate Payload schema (Input + tenantId for service layer)
		if (hasTenantId) {
			// Check if tenantId is optional in the original schema
			const tenantField = fields.find(field => field.name === TENANT_FIELD)
			const isTenantOptional = tenantField?.isOptional || false

			output += `export const ${modelName}PayloadSchema = ${modelName}InputSchema.extend({\n`
			if (isTenantOptional) {
				output += `  ${TENANT_FIELD}: z.string().optional(),\n`
			} else {
				output += `  ${TENANT_FIELD}: z.string(),\n`
			}
			output += `})\n\n`
			output += `export type ${modelName}Payload = z.infer<typeof ${modelName}PayloadSchema>\n\n`
		} else {
			// If no tenantId, payload is same as input
			output += `export const ${modelName}PayloadSchema = ${modelName}InputSchema\n\n`
			output += `export type ${modelName}Payload = ${modelName}Input\n\n`
		}

		// Generate Update schema (Input + required id)
		if (hasIdField) {
			output += `export const Update${modelName}InputSchema = ${modelName}InputSchema.extend({\n`
			output += `  id: z.string(),\n`
			output += `})\n\n`
			output += `export type Update${modelName}Input = z.infer<typeof Update${modelName}InputSchema>\n\n`

			// Generate Update Payload schema (UpdateInput + tenantId for service layer)
			if (hasTenantId) {
				// Check if tenantId is optional in the original schema
				const tenantField = fields.find(field => field.name === TENANT_FIELD)
				const isTenantOptional = tenantField?.isOptional || false

				output += `export const Update${modelName}PayloadSchema = Update${modelName}InputSchema.extend({\n`
				if (isTenantOptional) {
					output += `  ${TENANT_FIELD}: z.string().optional(),\n`
				} else {
					output += `  ${TENANT_FIELD}: z.string(),\n`
				}
				output += `})\n\n`
				output += `export type Update${modelName}Payload = z.infer<typeof Update${modelName}PayloadSchema>\n\n`
			} else {
				output += `export const Update${modelName}PayloadSchema = Update${modelName}InputSchema\n\n`
				output += `export type Update${modelName}Payload = Update${modelName}Input\n\n`
			}
		}
	})

	return output
}

try {
	const schemas = generateZodSchemas(schemaContent)
	writeFileSync('lib/zod/generated.ts', schemas)
	console.log('✅ Generated Zod schemas successfully!')
	console.log('📝 Generated schemas:')
	console.log('   - Base schemas (StudentSchema, etc.)')
	console.log('   - Input schemas (omit auto-managed fields + tenantId)')
	console.log('   - Payload schemas (Input + tenantId for services)')
	console.log('   - Update schemas (Input + required id)')
	console.log('   - Update Payload schemas (Update + tenantId for services)')
} catch (error) {
	console.error('❌ Error:', error)
}
