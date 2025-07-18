import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatMoney } from '@/utils/format-money'
import { TrendingDown, TrendingUp } from 'lucide-react'

export function RecentTransactions({ transactions }: { transactions: any[] }) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Date</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{transactions.map((transaction, index) => (
					<TableRow key={index}>
						<TableCell>
							{new Date(transaction.createdAt).toLocaleDateString('en-US', {
								day: '2-digit',
								month: 'short',
								year: 'numeric',
							})}
						</TableCell>
						<TableCell className="capitalize">
							<div className="flex w-[100px] items-center">
								{transaction.type === 'INCOME' ? (
									<TrendingUp size={20} className="mr-2 text-green-500" />
								) : (
									<TrendingDown size={20} className="mr-2 text-red-500" />
								)}
								<span className="capitalize"> {transaction.type}</span>
							</div>
						</TableCell>
						<TableCell
							className={
								transaction.type === 'INCOME'
									? 'text-green-600'
									: 'text-red-600'
							}
						>
							{formatMoney(transaction.amount)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
