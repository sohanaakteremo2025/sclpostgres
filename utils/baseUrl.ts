export function getBaseUrl() {
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL
	}

	if (process.env.NODE_ENV === 'development') {
		return 'http://localhost:3000'
	}

	return 'https://www.campaas.net'
}
