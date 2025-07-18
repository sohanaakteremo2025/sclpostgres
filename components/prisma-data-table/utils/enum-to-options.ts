/**
 * Converts enum values to options format
 * @param {Object|Array} enumObject - The enum object or array
 * @returns {Array} Array of options with label and value properties
 */

export function enumToOptions(enumObject: Record<string, string> | string[]) {
	const values = Array.isArray(enumObject)
		? enumObject
		: Object.values(enumObject)
	return values.map(value => ({
		label: value
			.replace(/_/g, ' ')
			.replace(
				/\w\S*/g,
				txt =>
					txt.charAt(0).toLocaleUpperCase() + txt.substr(1).toLocaleLowerCase(),
			),
		value: value,
	}))
}
