import CardWrapper from '@/components/card-wrapper'
import { getTenantId } from '@/lib/tenant'
import { SearchParams } from '@/types'
import { HandCoins } from 'lucide-react'
import { queryModel } from '@/components/prisma-data-table'
import { CACHE_KEYS } from '@/constants/cache'
import { PaymentTransactionTable } from '@/features/financial-management/payment-transaction/components/student-table'
import FeeCollectionSection from '@/features/financial-management/payment-transaction/components/fee-collection-form/FeeCollectionSection'

export default async function FeesCollectionPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>
}) {
	const searchParamsData = await searchParams
	const tenantId = await getTenantId()
	const dataPromise = queryModel({
		model: 'paymentTransaction',
		tenantId,
		searchParams: searchParamsData,
		select: {
			id: true,
			studentId: true,
			student: {
				select: {
					id: true,
					name: true,
					studentId: true,
					class: true,
					section: true,
					roll: true, // Added if you have this field
				},
			},
			tenant: {
				select: {
					id: true,
					logo: true,
					name: true,
					email: true,
					phone: true,
					address: true,
				},
			},
			payments: {
				select: {
					id: true,
					dueItemId: true,
					dueItem: {
						select: {
							id: true,
							title: true,
							originalAmount: true,
							finalAmount: true,
							paidAmount: true,
							description: true,
							status: true,
							category: true,
							createdAt: true,
							updatedAt: true,
						},
					},
					amount: true,
					method: true,
					reason: true,
					month: true,
					year: true,
					createdAt: true,
					updatedAt: true,
				},
			},
			totalAmount: true,
			collectedBy: true,
			transactionDate: true,
			printCount: true,
			createdAt: true,
			updatedAt: true,
		},
		cacheOptions: {
			revalidate: 300,
			cacheKey: CACHE_KEYS.PAYMENT_TRANSACTIONS.KEY(tenantId),
			tags: [CACHE_KEYS.PAYMENT_TRANSACTIONS.TAG(tenantId)],
		},
	})
	return (
		<CardWrapper
			title="Fees Collection"
			icon={<HandCoins className="w-6 h-6" />}
			description="Manage your fees collection"
			className=""
		>
			<FeeCollectionSection />
			<div className="w-1/2 mx-auto border-t-2 border-slate-200 my-4" />
			<PaymentTransactionTable dataPromise={dataPromise} />
		</CardWrapper>
	)
}
