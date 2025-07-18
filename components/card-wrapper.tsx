import React from 'react'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from './ui/card'
import { cn } from '@/lib/utils'

export default function CardWrapper({
	title,
	icon,
	children,
	description,
	className,
}: {
	title?: string | React.ReactNode
	icon?: React.ReactNode
	children?: React.ReactNode
	description?: string
	className?: string
}) {
	return (
		<Card
			className={cn(
				'flex flex-col w-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 relative',
				className,
			)}
		>
			<CardHeader className="pb-0">
				<CardTitle className="flex items-center gap-2 text-xl">
					{icon}
					{title || ''}
				</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>

			<CardContent className={cn('overflow-x-auto md:p-6 p-2', className)}>
				{children}
			</CardContent>
		</Card>
	)
}
