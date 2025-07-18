'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { PaymentMethod } from '@prisma/client'
import { updateSMSOrderStatus } from '@/lib/actions/sms.cms'
import { formatMoney } from '@/utils/format-money'

interface Order {
	id: string
	tenantId: string
	tenantName: string
	tenantDomain: string
	method: PaymentMethod
	credits: number
	amount: string
	trxId: string
	status: 'PENDING' | 'APPROVED' | 'REJECTED'
	createdAt: Date
	updatedAt: Date
}

export default function SMSOrdersTable({ SMSOrders }: { SMSOrders: Order[] }) {
	const [orders, setOrders] = useState<Order[]>(SMSOrders)
	const [actionLoading, setActionLoading] = useState<string | null>(null)
	const [filter, setFilter] = useState<
		'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
	>('all')

	const handleStatusUpdate = async (
		orderId: string,
		status: 'APPROVED' | 'REJECTED',
	) => {
		setActionLoading(orderId)
		try {
			await updateSMSOrderStatus(orderId, status)

			// Update local state
			setOrders(prevOrders =>
				prevOrders.map(order =>
					order.id === orderId ? { ...order, status } : order,
				),
			)

			toast.success(`Order ${status.toLowerCase()} successfully`)
		} catch (error) {
			toast.error(`Failed to ${status.toLowerCase()} order`)
		} finally {
			setActionLoading(null)
		}
	}

	const filteredOrders = orders.filter(order =>
		filter === 'all' ? true : order.status === filter,
	)

	const getStatusBadge = (status: string) => {
		const statusColors = {
			PENDING: 'bg-yellow-100 text-yellow-800',
			APPROVED: 'bg-green-100 text-green-800',
			REJECTED: 'bg-red-100 text-red-800',
		}

		return (
			<Badge className={statusColors[status as keyof typeof statusColors]}>
				{status}
			</Badge>
		)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}
	return (
		<div>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center">
								<Mail className="mr-2 h-5 w-5 text-primary" />
								SMS Orders
							</CardTitle>
							<CardDescription>
								Manage SMS credit orders from tenants
							</CardDescription>
						</div>
						<Select
							value={filter}
							onValueChange={(value: any) => setFilter(value)}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Orders</SelectItem>
								<SelectItem value="PENDING">Pending</SelectItem>
								<SelectItem value="APPROVED">Approved</SelectItem>
								<SelectItem value="REJECTED">Rejected</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Transaction ID</TableHead>
								<TableHead>Domain</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Credits</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredOrders.map(order => (
								<TableRow key={order.id}>
									<TableCell className="font-medium">{order.trxId}</TableCell>
									<TableCell className="font-mono text-sm">
										{order.tenantDomain}
									</TableCell>
									<TableCell className="font-mono text-sm">
										{order.tenantName}
									</TableCell>
									<TableCell>{order.credits.toLocaleString()}</TableCell>
									<TableCell>{formatMoney(order.amount)}</TableCell>
									<TableCell>{getStatusBadge(order.status)}</TableCell>
									<TableCell>{formatDate(`${order.createdAt}`)}</TableCell>
									<TableCell>
										{order.status === 'PENDING' ? (
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="default"
													onClick={() =>
														handleStatusUpdate(order.id, 'APPROVED')
													}
													disabled={actionLoading === order.id}
												>
													{actionLoading === order.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Check className="h-4 w-4" />
													)}
													<span className="ml-1">Approve</span>
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() =>
														handleStatusUpdate(order.id, 'REJECTED')
													}
													disabled={actionLoading === order.id}
												>
													{actionLoading === order.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<X className="h-4 w-4" />
													)}
													<span className="ml-1">Reject</span>
												</Button>
											</div>
										) : (
											<span className="text-sm text-muted-foreground">
												No actions available
											</span>
										)}
									</TableCell>
								</TableRow>
							))}
							{filteredOrders.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={7}
										className="text-center py-8 text-muted-foreground"
									>
										No orders found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
