'use server'

import { headers } from 'next/headers'

export async function getHeaderList() {
	return await headers()
}
