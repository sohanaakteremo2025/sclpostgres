// app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import bkashAuth from '@/utils/bkashAuth'
import bkashHeaders from '@/utils/bkashHeaders'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
	const session = await auth()
	const user = session?.user

	// ✅ Use formData instead of req.json()
	const form = await req.formData()
	const amount = form.get('amount')?.toString()
	const reason = form.get('reason')?.toString()

	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (!amount || !reason) {
		return NextResponse.json(
			{ error: 'Missing amount or reason' },
			{ status: 400 },
		)
	}

	try {
		const token = await bkashAuth(req)
		const baseUrl = req.nextUrl.origin

		const { data } = await axios.post(
			process.env.bkash_create_payment_url as string,
			{
				mode: '0011',
				payerReference: 'Tnt' + user.name?.slice(-20),
				callbackURL: `${baseUrl}/api/payment/callback?tenantId=${user.tenantId}&reason=${reason}`,
				amount,
				currency: 'BDT',
				intent: 'sale',
				merchantInvoiceNumber:
					'VisionSoftwares-' + user.id?.slice(-5) + uuidv4().substring(0, 5),
			},
			{
				headers: bkashHeaders(token),
			},
		)

		// ✅ Redirect to bKash URL after creation
		return NextResponse.redirect(data.bkashURL)
	} catch (error) {
		console.error('bKash error:', error)
		return NextResponse.json(
			{ error: (error as Error).message || 'Something went wrong' },
			{ status: 500 },
		)
	}
}
