import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function TenantOverview({ tenants }: { tenants: any[] }) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Next Payment</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tenants
					.filter(tenant => tenant.monthlyFee > 0)
					.slice(0, 5)
					.map((tenant, index) => (
						<TableRow key={index}>
							<TableCell>{tenant.name}</TableCell>
							<TableCell>
								<Badge variant={tenant.isActive ? 'default' : 'destructive'}>
									{tenant.status}
								</Badge>
							</TableCell>
							<TableCell>
								{new Date(tenant.nextPaymentDate).toLocaleDateString('en-US', {
									day: '2-digit',
									month: 'short',
									year: 'numeric',
								})}
							</TableCell>
						</TableRow>
					))}
			</TableBody>
		</Table>
	)
}
