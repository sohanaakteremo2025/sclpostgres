// utils/generateStudentId.ts

type GenerateStudentIdParams = {
	subdomain: string
	className: string
	sectionName: string
	roll: number | string
}

export class StudentIdGenerator {
	/**
	 * Normalizes roll number - accepts any positive number
	 */
	private static normalizeRoll(roll: number | string): number {
		const num = parseInt(String(roll).replace(/[^\d]/g, ''), 10)
		if (isNaN(num) || num < 1) {
			throw new Error('Roll must be a positive number')
		}
		return num
	}

	/**
	 * Extracts and validates first character of input
	 */
	private static getFirstChar(input: string, fieldName: string): string {
		if (!input?.trim()) {
			throw new Error(`${fieldName} cannot be empty`)
		}
		const char = input.trim().charAt(0).toUpperCase()
		if (!/[A-Z]/.test(char)) {
			throw new Error(`${fieldName} must start with a letter`)
		}
		return char
	}

	/**
	 * Generates a compact student ID in format: SCSRRR...
	 * S = First char of subdomain
	 * C = First char of className
	 * S = First char of sectionName
	 * RRR... = Roll number (no padding, supports any length)
	 * Example: "msimdhaka", "Madali", "A", 11 → "MMA11"
	 * Example: "msimdhaka", "Madali", "A", 1234 → "MMA1234"
	 */
	static generate({
		subdomain,
		className,
		sectionName,
		roll,
	}: GenerateStudentIdParams): string {
		console.log('Generating ID for:', {
			subdomain,
			className,
			sectionName,
			roll,
		})

		try {
			const subdomainChar = this.getFirstChar(subdomain, 'Subdomain')
			const classChar = this.getFirstChar(className, 'Class name')
			const sectionChar = this.getFirstChar(sectionName, 'Section name')
			const normalizedRoll = this.normalizeRoll(roll)

			const id = `${subdomainChar}${classChar}${sectionChar}${normalizedRoll}`

			console.log('Generated ID:', id)
			return id
		} catch (error) {
			throw new Error(
				`Failed to generate student ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}

	/**
	 * Utility method to validate if an ID follows the expected format
	 * Pattern: 3 uppercase letters + any number of digits (SCS\d+)
	 */
	static isValidFormat(id: string): boolean {
		const pattern = /^[A-Z]{3}\d+$/
		return pattern.test(id)
	}

	/**
	 * Parse an existing ID back to its components (useful for queries)
	 * Note: This returns the encoded characters, not the original full names
	 */
	static parseId(
		id: string,
	): {
		subdomainChar: string
		classChar: string
		sectionChar: string
		roll: number
	} | null {
		if (!this.isValidFormat(id)) return null

		return {
			subdomainChar: id.charAt(0),
			classChar: id.charAt(1),
			sectionChar: id.charAt(2),
			roll: parseInt(id.slice(3), 10),
		}
	}

	/**
	 * Generates multiple IDs for batch processing
	 */
	static generateBatch(
		baseParams: Omit<GenerateStudentIdParams, 'roll'>,
		rolls: (number | string)[],
	): string[] {
		return rolls.map(roll => this.generate({ ...baseParams, roll }))
	}

	/**
	 * Validates if a potential ID would cause conflicts
	 * This is useful before actually generating the ID
	 */
	static wouldConflict(
		params: GenerateStudentIdParams,
		existingIds: string[],
	): boolean {
		try {
			const newId = this.generate(params)
			return existingIds.includes(newId)
		} catch {
			return true // If generation fails, consider it a conflict
		}
	}

	/**
	 * Get ID statistics for debugging/monitoring
	 */
	static getIdStats(ids: string[]): {
		total: number
		byClass: Record<string, number>
		bySection: Record<string, number>
		bySubdomain: Record<string, number>
		rollRange: { min: number; max: number }
	} {
		const validIds = ids.filter(id => this.isValidFormat(id))

		const byClass: Record<string, number> = {}
		const bySection: Record<string, number> = {}
		const bySubdomain: Record<string, number> = {}
		const rolls: number[] = []

		validIds.forEach(id => {
			const parsed = this.parseId(id)
			if (parsed) {
				bySubdomain[parsed.subdomainChar] =
					(bySubdomain[parsed.subdomainChar] || 0) + 1
				byClass[parsed.classChar] = (byClass[parsed.classChar] || 0) + 1
				bySection[parsed.sectionChar] = (bySection[parsed.sectionChar] || 0) + 1
				rolls.push(parsed.roll)
			}
		})

		return {
			total: validIds.length,
			byClass,
			bySection,
			bySubdomain,
			rollRange:
				rolls.length > 0
					? {
							min: Math.min(...rolls),
							max: Math.max(...rolls),
						}
					: { min: 0, max: 0 },
		}
	}
}
