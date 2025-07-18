export function extractSubdomain(hostname: string): string | null {
	// Handle localhost development
	if (hostname.includes('localhost')) {
		// Support formats like: tenant.localhost:3000 or tenant.localhost
		const beforePort = hostname.split(':')[0]
		const parts = beforePort.split('.')
		if (parts.length > 1 && !parts[0].includes('localhost')) {
			return parts[0]
		}
		return null
	}

	// Handle production domains
	const parts = hostname.split('.')
	if (parts.length > 2 && parts[0] !== 'www') {
		return parts[0]
	}
	return null
}
