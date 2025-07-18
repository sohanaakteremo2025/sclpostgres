import { CompanyTransactionSchema } from '@/schema/companytransaction'
import { z } from 'zod'

export const CompanyTransactionCreateInputSchema =
	CompanyTransactionSchema.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})

export type CompanyTransactionCreateInput = z.infer<
	typeof CompanyTransactionCreateInputSchema
>

export const CompanyTransactionUpdateInputSchema =
	CompanyTransactionSchema.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})

export type CompanyTransactionUpdateInput = z.infer<
	typeof CompanyTransactionUpdateInputSchema
>
