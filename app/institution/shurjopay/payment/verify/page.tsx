// app/payment/verify/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentVerificationPage() {
	const searchParams = useSearchParams()
	const router = useRouter()

	// Extract verification information from URL params
	// This information is now passed by our server-side API
	const orderId = searchParams.get('order_id')
	const status = searchParams.get('status')
	const error = searchParams.get('error')
	const paymentRef = searchParams.get('paymentRef')

	// Navigate back to dashboard
	const redirectToDashboard = () => {
		router.push('/dashboard/student/billing')
	}

	// Different states based on payment result
	const isSuccess = status === 'success'
	const isFailed = status === 'failed'
	const isError = status === 'error'

	// Simple loading state to ensure params are available
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Small delay to ensure params are loaded
		const timer = setTimeout(() => setLoading(false), 500)
		return () => clearTimeout(timer)
	}, [])

	// Log payment info for debugging
	useEffect(() => {
		if (!loading) {
			console.log('Payment verification result:', {
				orderId,
				status,
				error,
				paymentRef,
			})
		}
	}, [loading, orderId, status, error, paymentRef])

	if (loading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center p-4">
				<div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
					<h1 className="mb-6 text-center text-2xl font-bold">
						Payment Verification
					</h1>
					<div className="flex flex-col items-center justify-center space-y-2">
						<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
						<p>Loading payment information...</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
				<h1 className="mb-6 text-center text-2xl font-bold">
					Payment Verification
				</h1>

				{isSuccess ? (
					<div className="space-y-4 text-center">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<svg
								className="h-8 w-8 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-green-600">
							Payment Successful!
						</h2>
						<p className="text-gray-600">
							Your payment has been verified and processed successfully.
						</p>

						{paymentRef && (
							<div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
								<p>
									<strong>Reference Number:</strong> {paymentRef}
								</p>
								<p>
									<strong>Order ID:</strong> {orderId}
								</p>
							</div>
						)}

						<button
							onClick={redirectToDashboard}
							className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
						>
							Return to Dashboard
						</button>
					</div>
				) : (
					<div className="space-y-4 text-center">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
							<svg
								className="h-8 w-8 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-red-600">
							{isError ? 'Verification Error' : 'Payment Verification Failed'}
						</h2>
						<p className="text-gray-600">
							{error || 'There was a problem with your payment verification.'}
						</p>
						<div className="flex space-x-3">
							<Link
								href="/dashboard/fees"
								className="mt-4 flex-1 rounded-md bg-gray-200 px-4 py-2 text-center font-semibold text-gray-700 hover:bg-gray-300"
							>
								Return to Dashboard
							</Link>
							<Link
								href="/dashboard/fees/pay"
								className="mt-4 flex-1 rounded-md bg-blue-500 px-4 py-2 text-center font-semibold text-white hover:bg-blue-600"
							>
								Try Again
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
