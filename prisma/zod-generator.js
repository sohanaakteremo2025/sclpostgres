#!/usr/bin/env node

const { generatorHandler } = require('@prisma/generator-helper')
const { writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')

function parseEnums(content) {
	const enums = content.match(/enum\s+(\w+)\s*{[^}]*}/g) || []

	return enums.map(enumMatch => {
		const nameMatch = enumMatch.match(/enum\s+(\w+)/)
		const enumName = nameMatch?.[1]
		const enumBody = enumMatch.match(/{([^}]*)}/)?.[1] || ''

		const values = enumBody
			.split('\n')
			.map(line => line.trim())
			.filter(line => line && !line.startsWith('//'))
			.map(line => line.replace(/,$/, '')) // Remove trailing comma

		return { enumName, values }
	})
}

function parseModels(content) {
	const models = content.match(/model\s+(\w+)\s*{[^}]*}/g) || []
	const enums = parseEnums(content)
	const enumNames = enums.map(e => e.enumName)

	return models.map(modelMatch => {
		const nameMatch = modelMatch.match(/model\s+(\w+)/)
		const modelName = nameMatch?.[1]
		const modelBody = modelMatch.match(/{([^}]*)}/)?.[1] || ''

		const fieldLines = modelBody
			.split('\n')
			.map(line => line.trim())
			.filter(
				line =>
					line &&
					!line.startsWith('//') &&
					!line.startsWith('@@') &&
					!line.includes('relation(') &&
					line.includes(' ') &&
					!line.startsWith('}') &&
					!line.startsWith('{'),
			)

		const fields = fieldLines
			.map(line => {
				const match = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?/)
				if (!match) return null

				const [, name, type, array, optional] = match

				// Skip relation fields (uppercase types that aren't primitives or enums)
				if (
					type[0] === type[0].toUpperCase() &&
					![
						'String',
						'Int',
						'Float',
						'Boolean',
						'DateTime',
						'Decimal',
					].includes(type) &&
					!enumNames.includes(type)
				) {
					return null
				}

				let zodType = 'z.string()'
				switch (type) {
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
						// Handle enums
						if (enumNames.includes(type)) {
							zodType = `${type}Schema`
						}
						break
				}

				if (array) zodType = `z.array(${zodType})`

				return {
					name,
					type,
					zodType,
					isArray: !!array,
					isOptional: !!optional,
				}
			})
			.filter(Boolean)

		return { modelName, fields, enums }
	})
}

function generateModelFile(model, allEnums) {
	const { modelName, fields } = model

	const hasTenantId = fields.some(f => f.name === 'tenantId')
	const hasId = fields.some(f => f.name === 'id')
	const hasDecimalField = fields.some(f => f.type === 'Decimal')
	const usedEnums = [
		...new Set(
			fields
				.filter(f => allEnums.some(e => e.enumName === f.type))
				.map(f => f.type),
		),
	]

	let code = `import { z } from 'zod'\n`

	// Only import DecimalSchema if this model has Decimal fields
	if (hasDecimalField) {
		code += `import { DecimalSchema } from './schemas'\n`
	}

	// Import enum schemas if used
	if (usedEnums.length > 0) {
		code += `import { ${usedEnums.map(e => `${e}Schema`).join(', ')} } from './schemas'\n`
	}

	code += `\n`

	code += `export const ${modelName}Schema = z.object({\n`
	fields.forEach(f => {
		let t = f.zodType
		if (f.isOptional) t += '.optional()'
		code += `  ${f.name}: ${t},\n`
	})
	code += `})\n\nexport type ${modelName} = z.infer<typeof ${modelName}Schema>\n\n`

	const createOmit = ['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy']
	if (hasTenantId) createOmit.push('tenantId')
	const actualCreateOmit = createOmit.filter(f =>
		fields.some(field => field.name === f),
	)

	code += `export const Create${modelName}InputSchema = ${modelName}Schema.omit({\n`
	actualCreateOmit.forEach(f => (code += `  ${f}: true,\n`))
	code += `})\n\nexport type Create${modelName}Input = z.infer<typeof Create${modelName}InputSchema>\n\n`

	if (hasTenantId) {
		const tenant = fields.find(f => f.name === 'tenantId')
		code += `export const Create${modelName}PayloadSchema = Create${modelName}InputSchema.extend({\n`
		code += `  tenantId: z.string()${tenant.isOptional ? '.optional()' : ''},\n`
		code += `})\n\nexport type Create${modelName}Payload = z.infer<typeof Create${modelName}PayloadSchema>\n\n`
	} else {
		code += `export const Create${modelName}PayloadSchema = Create${modelName}InputSchema\n\n`
		code += `export type Create${modelName}Payload = Create${modelName}Input\n\n`
	}

	if (hasId) {
		const updateOmit = ['createdAt', 'updatedAt', 'createdBy', 'updatedBy']
		const actualUpdateOmit = updateOmit.filter(f =>
			fields.some(field => field.name === f),
		)

		if (actualUpdateOmit.length > 0) {
			code += `export const Update${modelName}InputSchema = ${modelName}Schema.omit({\n`
			actualUpdateOmit.forEach(f => (code += `  ${f}: true,\n`))
			code += `})\n\n`
		} else {
			code += `export const Update${modelName}InputSchema = ${modelName}Schema\n\n`
		}

		code += `export type Update${modelName}Input = z.infer<typeof Update${modelName}InputSchema>\n\n`
	}

	return code
}

function generateSchemasFile(enums) {
	let code = `import { z } from 'zod'
import { Decimal } from 'decimal.js'

export const DecimalSchema = z.union([z.instanceof(Decimal), z.string(), z.number()]).transform(val => new Decimal(val))

`

	// Generate enum schemas
	enums.forEach(enumDef => {
		const { enumName, values } = enumDef
		code += `export const ${enumName}Schema = z.enum([${values.map(v => `'${v}'`).join(', ')}])\n`
		code += `export type ${enumName} = z.infer<typeof ${enumName}Schema>\n\n`
	})

	return code
}

generatorHandler({
	onManifest() {
		return {
			defaultOutput: '../lib/zod',
			prettyName: 'Per-Model Zod Schema Generator',
		}
	},
	async onGenerate(options) {
		try {
			const outputDir = options.generator.output?.value || './lib/zod'
			mkdirSync(outputDir, { recursive: true })

			const enums = parseEnums(options.datamodel)
			const models = parseModels(options.datamodel)
			const modelNames = []

			// Generate shared schemas file with enums
			const schemasPath = join(outputDir, 'schemas.ts')
			const schemasContent = generateSchemasFile(enums)
			writeFileSync(schemasPath, schemasContent)

			// Generate individual model files
			for (const model of models) {
				const fileName = `${model.modelName}.ts`
				const filePath = join(outputDir, fileName)
				const code = generateModelFile(model, enums)
				writeFileSync(filePath, code)
				modelNames.push(model.modelName)
			}

			// Create barrel file
			const indexPath = join(outputDir, 'index.ts')
			const indexContent =
				[
					`export * from './schemas'`,
					...modelNames.map(name => `export * from './${name}'`),
				].join('\n') + '\n'
			writeFileSync(indexPath, indexContent)

			console.log(`✅ Zod schemas generated per model in: ${outputDir}`)
		} catch (error) {
			console.error('❌ Failed to generate Zod schemas:', error)
		}
	},
})
