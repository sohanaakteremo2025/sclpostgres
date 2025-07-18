// app/actions/payment.ts
'use server'

import { getSubdomainDB } from '../getSubdomainDB'
import { auth } from '@/auth'
import { getStudentById } from './student.action'
import { submitFeePayments } from './student.fee.action'
import {
	getPaymentMethodCredentials,
	isPaymentMethodEnabled,
} from '@/config/tenant-payment-config'
import { getTenantSubdomain } from '../get-tenant-subdomain-from-header'

// Define fee payment request type
type FeePaymentRequest = {
	studentId: string
	feeItemIds: string[]
	totalAmount: number
	paymentMonth?: string // Add this for the month being paid for
	month?: string // Alternative name for backward compatibility
	amountBreakdown: {
		feeItemId: string
		amount: number
		month?: string // Optional month for each item
	}[]
}
// Direct API integration with ShurjoPay
// Update your initiateFeePayment function to include month information
// without requiring any model changes

export async function initiateFeePayment(paymentData: FeePaymentRequest) {
	const session = await auth()
	const userId = session?.user?.profileId as string
	const student = await getStudentById(userId)
	const tenantSubdomain = await getTenantSubdomain()
	if (!session?.user) {
		throw new Error('Unauthorized')
	}

	if (!isPaymentMethodEnabled(tenantSubdomain, 'shurjopay')) {
		throw new Error('ShurjoPay payment method is not enabled for this tenant')
	}

	// Get ShurjoPay credentials for this tenant
	const credentials = getPaymentMethodCredentials(tenantSubdomain, 'shurjopay')

	try {
		const tokenResponse = await fetch(
			`${credentials?.endpoint}/api/get_token`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					username: credentials?.username,
					password: credentials?.password,
				}),
			},
		)

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text()
			console.error(
				'Authentication failed with status:',
				tokenResponse.status,
				tokenResponse.statusText,
			)
			console.error('Error response:', errorText)
			throw new Error(`Authentication failed: ${tokenResponse.statusText}`)
		}

		const tokenData = await tokenResponse.json()

		if (!tokenData.token) {
			throw new Error('No token in authentication response')
		}

		const token = tokenData.token
		const storeId = tokenData.store_id

		// Step 2: Create a unique order ID
		const orderId = `FEE-${paymentData.studentId}-${Date.now()}-${Math.floor(
			Math.random() * 10000,
		)}`

		// Add month information to the metadata
		const essentialMetadata = {
			// Only include the fee item IDs and amounts (no month info in metadata)
			amountBreakdown: paymentData.amountBreakdown.map(item => ({
				feeItemId: item.feeItemId,
				amount: item.amount,
			})),
		}

		// Store metadata as base64 encoded JSON
		const feeItemsMetadata = Buffer.from(
			JSON.stringify(essentialMetadata),
		).toString('base64')

		// url building
		const returnUrl = `${credentials?.return_url}/api/payment/shurjopay/verify/${feeItemsMetadata}`

		// Step 3: Create payment request

		const paymentRequest = {
			store_id: storeId,
			prefix: credentials?.prefix,
			token: token,
			amount: paymentData.totalAmount,
			order_id: orderId,
			currency: 'BDT',
			customer_name: student.fullName || 'Student',
			customer_phone: student.phone || 'N/A',
			customer_email: student.email || 'N/A',
			customer_address: 'N/A',
			client_ip: '127.0.0.1',
			customer_city: 'N/A',
			customer_post_code: 'N/A',
			return_url: returnUrl,
			cancel_url: credentials?.return_url,
			value1: student.id, // Using value fields to pass any additional data
			value2: 'fee-payment',
			value3: paymentData.paymentMonth || '', // Store month in value3 as backup
			value4: '',
		}

		const paymentResponse = await fetch(
			`${credentials?.endpoint}/api/secret-pay`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(paymentRequest),
			},
		)

		const responseText = await paymentResponse.text()

		let paymentResponseData
		try {
			paymentResponseData = JSON.parse(responseText)
		} catch (e) {
			console.error('Failed to parse payment response JSON:', e)
			throw new Error('Invalid JSON response from payment gateway')
		}

		if (!paymentResponseData.checkout_url) {
			throw new Error(
				'No checkout URL in payment response: ' +
					JSON.stringify(paymentResponseData),
			)
		}

		return {
			success: true,
			paymentUrl: paymentResponseData.checkout_url,
			orderId,
		}
	} catch (error) {
		console.error('Payment initialization error:', error)
		return { success: false, error: (error as Error).message }
	}
}

export async function verifyFeePayment(orderId: string, metadata?: string) {
	const prisma = await getSubdomainDB()
	const tenantSubdomain = await getTenantSubdomain()
	const credentials = getPaymentMethodCredentials(tenantSubdomain, 'shurjopay')

	try {
		// Step 1: Get authentication token
		const tokenResponse = await fetch(
			`${credentials?.endpoint}/api/get_token`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					username: credentials?.username,
					password: credentials?.password,
				}),
			},
		)

		if (!tokenResponse.ok) {
			throw new Error(`Authentication failed: ${tokenResponse.statusText}`)
		}

		const tokenData = await tokenResponse.json()
		const token = tokenData.token

		// Step 2: Verify payment
		const verificationResponse = await fetch(
			`${credentials?.endpoint}/api/verification`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					order_id: orderId,
				}),
			},
		)

		if (!verificationResponse.ok) {
			throw new Error(
				`Payment verification failed: ${verificationResponse.statusText}`,
			)
		}

		// Handle the verification result
		let verificationResult = await verificationResponse.json()

		// If the response is an array, take the first item
		if (Array.isArray(verificationResult) && verificationResult.length > 0) {
			verificationResult = verificationResult[0]
		}

		// Check payment status
		const isCompleted =
			verificationResult.sp_code === 1000 ||
			verificationResult.sp_code === '1000' ||
			(verificationResult.bank_status &&
				verificationResult.bank_status.toLowerCase() === 'success')

		if (!isCompleted) {
			return {
				success: false,
				message: verificationResult.sp_message || 'Payment verification failed',
				paymentDetails: verificationResult,
			}
		}

		// Get student ID from value1
		const studentId = verificationResult.value1

		if (!studentId) {
			console.error('No student ID found in verification result')
			return {
				success: true,
				paymentDetails: verificationResult,
				error: 'Student ID missing, could not create payment records',
			}
		}

		// Extract payment month and fee items from metadata
		const { feeItems, paymentMonth } = tryExtractPaymentInfo(
			metadata,
			verificationResult,
		)

		// Create payment records using submitFeePayments
		try {
			let totalPaidAmount = 0
			const paymentDate = new Date() // Current date when payment was made

			if (feeItems && feeItems.length > 0) {
				// Use payment month if available, otherwise use current date
				const feeMonth = paymentMonth ? new Date(paymentMonth) : new Date()

				// Prepare payment data for submitFeePayments
				const paymentRequests = feeItems.map((item: any) => ({
					feeItemId: item.feeItemId,
					amountPaid: item.amount,
					datePaid: feeMonth,
					feeMonth: feeMonth,
					studentId: studentId,
				}))

				// Calculate total for transaction record
				totalPaidAmount = feeItems.reduce(
					(sum: any, item: any) => sum + item.amount,
					0,
				)

				// Submit all fee payments using the existing function
				const createdPayments = await submitFeePayments(paymentRequests)

				// Create transaction for tenant
				await createTenantTransaction(
					prisma,
					totalPaidAmount,
					verificationResult,
					studentId,
				)

				return {
					success: true,
					paymentDetails: verificationResult,
					payments: createdPayments,
					paymentCount: createdPayments.length,
				}
			} else {
				// Create a general payment with the total amount
				const amount = parseFloat(verificationResult.amount) || 0

				if (amount > 0) {
					// Use a default fee item ID - replace with your actual ID
					const defaultFeeItemId = '67f7276b978167998a503d7d'

					// Use payment month if available, otherwise use current date
					const feeMonth = paymentMonth ? new Date(paymentMonth) : new Date()

					// Create a single payment
					const paymentRequests = [
						{
							feeItemId: defaultFeeItemId,
							amountPaid: amount,
							datePaid: feeMonth,
							feeMonth: feeMonth,
							studentId: studentId,
						},
					]

					// Submit the general payment
					const createdPayments = await submitFeePayments(paymentRequests)

					// Create transaction for tenant
					await createTenantTransaction(
						prisma,
						amount,
						verificationResult,
						studentId,
					)

					return {
						success: true,
						paymentDetails: verificationResult,
						paymentId: createdPayments[0]?.id,
					}
				} else {
					return {
						success: true,
						paymentDetails: verificationResult,
						error:
							'No amount information available, could not create payment record',
					}
				}
			}
		} catch (dbError) {
			console.error('Error creating payment records:', dbError)
			return {
				success: true,
				paymentDetails: verificationResult,
				error: dbError instanceof Error ? dbError.message : 'Database error',
			}
		}
	} catch (error) {
		console.error('Payment verification error:', error)
		return { success: false, error: (error as Error).message }
	}
}

// Import your existing submitFeePayments function

// Helper function to create a transaction record for the tenant
async function createTenantTransaction(
	prisma: any,
	amount: number,
	verificationResult: any,
	studentId: string,
) {
	try {
		// Get student info for the transaction label
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			select: { fullName: true, studentId: true, tenantId: true },
		})

		// Create transaction record
		const transaction = await prisma.transaction.create({
			data: {
				label: `Fee payment for ${student?.fullName || 'Student'} (${
					student?.studentId || studentId
				})`,
				note: `Payment received via ShurjoPay. Transaction ID: ${
					verificationResult.bank_trx_id || verificationResult.order_id || ''
				}`,
				category: 'monthly_fee',
				type: 'income',
				amount: amount,
				tenantId: student.tenantId,
				transactionBy: 'ShurjoPay',
			},
		})

		console.log(`Created tenant transaction record: ${transaction.id}`)
		return transaction
	} catch (error) {
		console.error('Error creating transaction record:', error)
		// Don't throw error, just log it - we don't want to fail the whole payment process
		// if transaction creation fails
		return null
	}
}

// Helper function to extract payment info from metadata
function tryExtractPaymentInfo(metadata?: string, verificationResult?: any) {
	const result = {
		feeItems: [] as any,
		paymentMonth: null,
	}

	// Check if month info is in value3 field of verification result
	if (verificationResult && verificationResult.value3) {
		try {
			const monthFromValue3 = verificationResult.value3.trim()
			if (monthFromValue3 && monthFromValue3.length > 0) {
				result.paymentMonth = monthFromValue3
			}
		} catch (e) {
			console.error('Failed to extract month from value3:', e)
		}
	}

	if (!metadata) return result

	try {
		// Clean up metadata if it has URL components
		let cleanMetadata = metadata
		if (metadata.includes('?order_id=')) {
			cleanMetadata = metadata.split('?order_id=')[0]
		}

		// Try to URL decode first
		try {
			cleanMetadata = decodeURIComponent(cleanMetadata)
		} catch (e) {
			// Ignore decoding errors
		}

		// Decode from base64
		try {
			const decodedText = Buffer.from(cleanMetadata, 'base64').toString()

			// Try to parse the JSON
			try {
				const parsed = JSON.parse(decodedText)

				// Look for payment month information
				if (parsed.paymentMonth) {
					result.paymentMonth = parsed.paymentMonth
				} else if (parsed.month) {
					result.paymentMonth = parsed.month
				}

				// Extract fee items
				if (Array.isArray(parsed)) {
					result.feeItems = parsed
				} else if (parsed && typeof parsed === 'object') {
					if (Array.isArray(parsed.amountBreakdown)) {
						result.feeItems = parsed.amountBreakdown
					} else if (Array.isArray(parsed.feeItems)) {
						result.feeItems = parsed.feeItems
					}
				}
			} catch (jsonError) {
				console.error('JSON parsing failed:', jsonError)
			}
		} catch (base64Error) {
			console.error('Base64 decoding failed:', base64Error)
		}
	} catch (e) {
		console.error('Failed to process metadata:', e)
	}

	return result
}
