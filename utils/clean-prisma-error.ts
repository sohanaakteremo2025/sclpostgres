// Clean error messages from development noise
export function cleanErrorMessage(error: any): string {
	if (!error) return 'Unknown error'

	let message = error.message || error.toString()

	// Remove Turbopack/webpack noise
	message = message.replace(
		/\/\/ Invalid `.*?` invocation in[\s\S]*?→.*?\n/g,
		'',
	)

	// Remove file paths with Turbopack encoding
	message = message.replace(
		/__TURBOPACK__imported__module__\$5b\$project\$5d.*?\$5d\$__\$28\$ecmascript\$29\$__\[".*?"\]/g,
		'prisma',
	)

	// Remove Next.js chunk references
	message = message.replace(
		/in\s+.*?\.next\/server\/chunks\/.*?\.js:\d+:\d+/g,
		'',
	)

	// Remove line number references and clean whitespace
	message = message.replace(/\s+\d+\s+.*?\n/g, ' ')
	message = message.replace(/\s+/g, ' ').trim()

	// Extract actual Prisma errors
	const prismaErrorMatch = message.match(
		/(Unique constraint failed|Foreign key constraint failed|Record to update not found|.*?Error:.*)/,
	)
	if (prismaErrorMatch) {
		message = prismaErrorMatch[1]
	}

	return message
}
