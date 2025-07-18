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
	const { credits, price } = await req.json()

	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const token = await bkashAuth(req)
		//find request website baseURL from request object
		const baseUrl = req.nextUrl.origin

		const { data } = await axios.post(
			process.env.bkash_create_payment_url as string,
			{
				mode: '0011',
				payerReference: 'SMS' + user.name?.slice(20),
				// append tenantId to callback url
				callbackURL: `${baseUrl}/api/sms-payment/callback?tenantId=${user.tenantId}&credits=${credits}`,
				amount: price,
				currency: 'BDT',
				intent: 'sale',
				merchantInvoiceNumber:
					'VisionSMS-' + user.id?.slice(-5) + uuidv4().substring(0, 5),
			},
			{
				headers: bkashHeaders(token),
			},
		)

		return NextResponse.json({ bkashURL: data.bkashURL })
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 401 },
		)
	}
}
