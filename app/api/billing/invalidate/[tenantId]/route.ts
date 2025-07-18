import { NextResponse } from 'next/server'
import { billingCache } from '@/lib/billing/billing-cache'
import { auth } from '@/auth'

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ tenantId: string }> },
) {
	try {
		const session = await auth()
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { tenantId } = await params
		const cacheKey = `billing:${tenantId}`

		billingCache.invalidate(cacheKey)

		return NextResponse.json({ success: true, message: 'Cache invalidated' })
	} catch (error) {
		console.error('Error invalidating cache:', error)
		return NextResponse.json(
			{ error: 'Failed to invalidate cache' },
			{ status: 500 },
		)
	}
}
