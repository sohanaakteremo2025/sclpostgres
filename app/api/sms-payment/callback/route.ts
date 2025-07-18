// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import bkashAuth from '@/utils/bkashAuth'
import bkashHeaders from '@/utils/bkashHeaders'
import { getPrismaClient } from '@/lib/db'
import { orderSMSCredit } from '@/lib/actions/sms.action'
const prisma = getPrismaClient()
export async function GET(req: NextRequest) {
	const baseUrl = req.nextUrl.origin
	try {
		const { searchParams } = new URL(req.url)
		const token = await bkashAuth(req)
		const paymentID = searchParams.get('paymentID')
		const status = searchParams.get('status')
		const tenantId = searchParams.get('tenantId')
		const credits = searchParams.get('credits')

		const tenant = await prisma.tenant.findUnique({
			where: { id: tenantId as string },
		})

		// const user = await getCurrentUser()

		if (status === 'cancel' || status === 'failure') {
			// todo: send email to user about failure
			// await sendEmail({ to: user?.email as string, type: 'paymentFailure' })
			// console.log('Failed to initiate by api/payment/create')
			return NextResponse.redirect(`${baseUrl}/error?message=${status}`)
		}

		const { data } = await axios.post(
			process.env.bkash_execute_payment_url as string,
			{ paymentID },
			{
				headers: bkashHeaders(token),
			},
		)

		//check if actually paid
		if (data && data.statusCode === '0000') {
			// create order sms credit
			await orderSMSCredit({
				tenantId: tenantId as string,
				credits: parseInt(credits as string),
				price: parseInt(data.amount),
				transactionId: data.trxID,
			})

			return NextResponse.redirect(`${baseUrl}/dashboard`)
		} else {
			return NextResponse.redirect(
				`${baseUrl}/error?message=${'payment-failed'}`,
			)
		}
	} catch (error) {
		// console.error('REDIrecting:-> error at last step', error)
		return NextResponse.redirect(`${baseUrl}/error?message=${error}`)
	}
}
