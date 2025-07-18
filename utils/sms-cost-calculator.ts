/**
 * Calculate SMS parts more accurately based on character encoding
 * GSM-7 encoding: Standard Latin characters (160 chars per SMS)
 * UCS-2 encoding: Non-Latin characters like Bengali (70 chars per SMS)
 */
function calculateSMSParts(message: string): number {
	// GSM-7 character set (basic Latin alphabet + some special characters)
	const gsm7Charset =
		'@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}[~]|€ÆæßÉ!"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà '
	const gsm7ExtendedChars = '|^€{}[]~\\'

	const GSM7_LIMIT = 160 // 160 characters per SMS for GSM-7 encoding
	const UCS2_LIMIT = 70 // 70 characters per SMS for UCS-2 encoding (Unicode)

	// Check if message contains any non-GSM characters
	let isGsm7 = true
	let effectiveLength = 0

	for (const char of message) {
		if (!gsm7Charset.includes(char)) {
			isGsm7 = false
			break
		}

		// Count extended GSM chars as 2 characters
		effectiveLength += gsm7ExtendedChars.includes(char) ? 2 : 1
	}

	// For longer messages, the header takes some space, reducing per-message capacity
	// For concatenated messages:
	// - GSM-7: 153 chars per part after the first
	// - UCS-2: 67 chars per part after the first
	const charLimit = isGsm7 ? GSM7_LIMIT : UCS2_LIMIT

	if (isGsm7) {
		if (effectiveLength <= GSM7_LIMIT) {
			return 1
		} else {
			return Math.ceil(effectiveLength / 153) // Concatenated GSM-7 messages
		}
	} else {
		// UCS-2 encoding for non-Latin alphabets (like Bengali)
		if (message.length <= UCS2_LIMIT) {
			return 1
		} else {
			return Math.ceil(message.length / 67) // Concatenated UCS-2 messages
		}
	}
}

/**
 * Calculate the total SMS cost considering recipient count and message parts
 */
export function calculateSMSCost(
	message: string,
	recipientPhones: string,
): {
	messageParts: number
	recipientCount: number
	totalCost: number
	messageType: string
} {
	// Count the number of recipient phone numbers
	const numbers = recipientPhones
		.split(',')
		.map(num => num.trim())
		.filter(Boolean)
	const recipientCount = numbers.length

	// Calculate message parts based on character encoding
	const messageParts = calculateSMSParts(message)

	// Calculate total SMS cost
	const totalCost = recipientCount * messageParts

	return {
		messageParts,
		recipientCount,
		totalCost,
		messageType: messageParts > 1 ? 'Concatenated' : 'Single',
	}
}
