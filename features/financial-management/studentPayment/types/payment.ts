import { PaymentMethod } from '@/lib/zod'
import { Decimal } from 'decimal.js'

export interface PaymentData {
	month: number
	year: number
	studentId: string
	reason: string
	dueItems: {
		dueItemId: string
		collectAmount: number
		accountId: string
		categoryId: string
	}[]
}

export interface ProcessPaymentRequest extends PaymentData {
	tenantId: string
	collectedBy?: string
}

// Types for better type safety
export interface DueItemUpdate {
	id: string
	paidAmount: Decimal
	status: 'PAID' | 'PARTIAL'
}

export interface AccountUpdate {
	id: string
	incrementAmount: Decimal
}

export interface TransactionCreate {
	tenantId: string
	type: 'INCOME'
	amount: Decimal
	label: string
	note: string
	categoryId: string
	transactionBy: string | undefined
	accountId: string
}

export interface StudentPaymentCreate {
	amount: Decimal
	method: PaymentMethod
	reason: string
	month: number
	year: number
	tenantId: string
	dueItemId: string
	paymentTransactionId: string
}
