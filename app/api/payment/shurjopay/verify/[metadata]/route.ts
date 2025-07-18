// app/api/payment/shurjopay/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyFeePayment } from '@/lib/actions/shurjopay.action'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ metadata: string }> },
) {
	// Get the complete URL for parsing
	const fullUrl = request.url
	const { searchParams } = new URL(fullUrl)
	const orderId = searchParams.get('order_id')
	const { metadata } = await params

	console.log('Parsed URL parameters:', { orderId, metadata })

	if (!orderId) {
		console.error('Missing order_id parameter in:', fullUrl)
		return NextResponse.json(
			{ success: false, error: 'Missing order_id parameter' },
			{ status: 400 },
		)
	}

	try {
		// Verify the payment server-side
		const result = await verifyFeePayment(orderId, metadata as any)
		console.log('Verification result:', result)

		// Get the host (tenant.domain.com) from the request
		const host = request.headers.get('host') || ''
		console.log('Request host:', host)

		// Construct proper redirect URL for multi-tenant site
		// Use the same host/domain as the incoming request
		let protocol = 'https://'
		// For localhost development
		if (host.includes('localhost') || host.includes('127.0.0.1')) {
			protocol = 'http://'
		}

		const baseRedirectUrl = `${protocol}${host}/shurjopay/payment/verify`
		const redirectParams = new URLSearchParams()

		// Add required parameters
		redirectParams.set('order_id', orderId)
		redirectParams.set('status', result.success ? 'success' : 'failed')

		// Add optional parameters based on the result
		if (result.success) {
			// Add payment reference if available
			if (result.paymentDetails) {
				const paymentRef =
					result.paymentDetails.bank_trx_id ||
					result.paymentDetails.order_id ||
					orderId
				redirectParams.set('paymentRef', paymentRef)

				// Add amount if available
				if (result.paymentDetails.amount) {
					redirectParams.set('amount', result.paymentDetails.amount.toString())
				}

				// Add payment time if available
				if (result.paymentDetails.date_time) {
					redirectParams.set('time', result.paymentDetails.date_time)
				}
			}

			// Add payment record information
			if (result.paymentCount) {
				redirectParams.set('paymentCount', result.paymentCount.toString())
			}
		} else {
			// Add error information if verification failed
			if (result.error || result.message) {
				redirectParams.set('error', result.error || result.message)
			}
		}

		const redirectUrl = `${baseRedirectUrl}?${redirectParams.toString()}`
		console.log('Redirecting to:', redirectUrl)

		return NextResponse.redirect(redirectUrl)
	} catch (error) {
		console.error('Payment verification API error:', error)

		// Get the host from the request for error redirect
		const host = request.headers.get('host') || ''
		let protocol = 'https://'
		if (host.includes('localhost') || host.includes('127.0.0.1')) {
			protocol = 'http://'
		}

		// Redirect to client page with error
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error'
		const baseRedirectUrl = `${protocol}${host}/shurjopay/payment/verify`
		const redirectUrl = `${baseRedirectUrl}?order_id=${encodeURIComponent(
			orderId || '',
		)}&status=error&error=${encodeURIComponent(errorMessage)}`

		console.log('Error redirect to:', redirectUrl)
		return NextResponse.redirect(redirectUrl)
	}
}
