'use server'

import { NextResponse } from 'next/server'

export async function redirectToBkash(bkashURL: string) {
	// Redirect to the provided URL
	return NextResponse.redirect(bkashURL)
}
