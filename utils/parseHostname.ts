export const parseHostname = (hostname: string) => {
	// Remove protocol, www, and port number
	const cleanHostname = hostname
		.replace(/(^\w+:|^)\/\//, '') // removes protocol
		.replace('www.', '') // removes www
		.replace(/:\d+$/, '') // removes port number

	// Check if it's a localhost address
	const isLocalhost = cleanHostname.includes('localhost')

	if (isLocalhost) {
		// Handle localhost (including subdomains)
		const parts = cleanHostname.split('.')
		if (parts.length > 1) {
			return {
				baseHost: 'localhost', // Always 'localhost'
				currentHost: parts[0], // Subdomain
			}
		}

		return {
			baseHost: 'localhost', // 'localhost' without subdomain
			currentHost: '', // No subdomain
		}
	}

	// For non-localhost URLs, split the hostname by '.'
	const parts = cleanHostname.split('.').filter(Boolean)

	if (parts.length > 2) {
		// Has a subdomain
		return {
			baseHost: parts.slice(-2).join('.'), // Base domain (e.g., 'campaas.net')
			currentHost: parts.slice(0, -2).join('.'), // Subdomain(s)
		}
	}

	return {
		baseHost: parts.join('.'), // Base domain without subdomain (e.g., 'campaas.net')
		currentHost: '', // No subdomain
	}
}
