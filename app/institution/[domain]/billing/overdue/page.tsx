// app/institution/[tenantId]/billing/overdue/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Suspense } from 'react'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { billingCache } from '@/lib/billing/billing-cache'

export default async function BillingOverduePage({
	params,
	searchParams,
}: {
	params: Promise<{ domain: string }>
	searchParams: Promise<{ isRedirected: string }>
}) {
	const session = await auth()
	const user = session?.user

	if (!user || user.role !== 'ADMIN') {
		redirect('/login')
	}
	const { domain } = await params
	const { isRedirected } = await searchParams

	const overdueSchedules = await prisma.tenantBillingSchedule.findMany({
		where: {
			tenantId: user.tenantId,
			status: 'ACTIVE',
			nextDueDate: {
				lt: new Date(),
			},
		},
		select: {
			id: true,
			label: true,
			amount: true,
			nextDueDate: true,
			frequency: true,
		},
		orderBy: {
			nextDueDate: 'asc',
		},
	})

	if (overdueSchedules.length === 0 && !isRedirected) {
		//invalidate billing cache
		billingCache.invalidate(user.tenantId || '')
		redirect(`/institution/${domain}/admin`)
	}

	const totalOverdueAmount = overdueSchedules.reduce(
		(total, schedule) => total + Number(schedule.amount),
		0,
	)

	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-white">
					<p className="text-sm text-gray-500">Loading overdue payments...</p>
				</div>
			}
		>
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-8">
				<Card className="w-full max-w-xl border-pink-200">
					<CardHeader className="text-center space-y-4">
						<div className="mx-auto">
							<AlertCircle className="w-10 h-10 text-red-600" />
						</div>
						<CardTitle className="text-2xl">Payment Overdue</CardTitle>
						<CardDescription>
							You have {overdueSchedules.length} overdue payment
							{overdueSchedules.length > 1 ? 's' : ''}. Please clear dues to
							continue using the system.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100">
							<h4 className="font-semibold text-pink-900 mb-3">
								Overdue Details
							</h4>
							<ul className="space-y-3 text-sm">
								{overdueSchedules.map(schedule => {
									const daysOverdue = Math.ceil(
										(new Date().getTime() - schedule.nextDueDate.getTime()) /
											(1000 * 60 * 60 * 24),
									)
									return (
										<li
											key={schedule.id}
											className="flex justify-between items-start"
										>
											<div>
												<p className="font-medium text-gray-800">
													{schedule.label}
												</p>
												<Badge variant="destructive" className="mt-1">
													{daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
												</Badge>
											</div>
											<span className="font-bold text-red-600">
												৳{Number(schedule.amount).toFixed(2)}
											</span>
										</li>
									)
								})}
							</ul>
							<Separator className="my-3" />
							<div className="flex justify-between font-semibold text-pink-800">
								<span>Total Due</span>
								<span>৳{totalOverdueAmount.toFixed(2)}</span>
							</div>
						</div>

						{/* Payment Options */}
						<div className="space-y-4">
							<Alert className="bg-pink-50 border-pink-200">
								<div className="flex items-center gap-3">
									<Image
										src="/company/bkash-logo.png"
										alt="bKash"
										width={40}
										height={40}
										className="rounded"
									/>
									<div>
										<AlertTitle className="text-pink-800">
											We accept bKash payments only
										</AlertTitle>
										<AlertDescription className="text-pink-700">
											Contact us if you want to make payment through Nagad or
											other payment methods.
										</AlertDescription>
									</div>
								</div>
							</Alert>

							<div className="space-y-3">
								{overdueSchedules.map(schedule => (
									<form
										key={schedule.id}
										action="/api/payment/create"
										method="POST"
									>
										<input
											type="hidden"
											name="reason"
											value={schedule.label.split(' ').join('_')}
										/>
										<input
											type="hidden"
											name="amount"
											value={Number(schedule.amount)}
										/>

										<Button
											type="submit"
											className="w-full bg-pink-600 hover:bg-pink-700"
										>
											Pay {schedule.label} — ৳
											{Number(schedule.amount).toFixed(2)}
										</Button>
									</form>
								))}

								{overdueSchedules.length > 1 && (
									<form action="/api/payment/create" method="POST">
										<input
											type="hidden"
											name="reason"
											value="all_overdue_payments"
										/>
										<input
											type="hidden"
											name="amount"
											value={totalOverdueAmount}
										/>

										<Button
											type="submit"
											className="w-full bg-green-600 hover:bg-green-700"
										>
											Pay All Overdue — ৳{totalOverdueAmount.toFixed(2)}
										</Button>
									</form>
								)}
							</div>
						</div>
					</CardContent>

					<CardFooter>
						<p className="text-xs text-gray-400 text-center w-full">
							If you think this is a mistake, please contact our support team.
						</p>
					</CardFooter>
				</Card>
			</div>
		</Suspense>
	)
}
