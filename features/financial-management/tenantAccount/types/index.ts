import { z } from 'zod'

export const fundTransferSchema = z.object({
	fromTenantAccount: z.string(),
	toTenantAccount: z.string(),
	amount: z.number(),
})

export type FundTransferInput = z.infer<typeof fundTransferSchema>

export const depositSchema = z.object({
	tenantId: z.string(),
	accountId: z.string(),
	amount: z.number(),
})

export const depositInputSchema = z.object({
	accountId: z.string(),
	amount: z.number(),
})

export type DepositPayloadInput = z.infer<typeof depositSchema>
export type DepositInput = z.infer<typeof depositInputSchema>

export const withdrawSchema = z.object({
	tenantId: z.string(),
	accountId: z.string(),
	amount: z.number(),
})

export const withdrawInputSchema = z.object({
	accountId: z.string(),
	amount: z.number(),
})

export type WithdrawPayloadInput = z.infer<typeof withdrawSchema>
export type WithdrawInput = z.infer<typeof withdrawInputSchema>
