export const fetchSiteByDomain = ([url, domain]: [string, string]) =>
	fetch(url, {
		method: 'GET',
		headers: {
			'x-domain': domain,
		},
	}).then(res => {
		if (!res.ok) {
			throw new Error(`Failed to fetch: ${res.statusText}`)
		}
		return res.json()
	})
