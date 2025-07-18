import React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'
import { TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import LucideIcon from './LucideIcon'
import { LucideIconName } from './types'

export function SingleMenu({
	index,
	label,
	active,
	isOpen,
	href,
	Icon,
	isActive,
}: {
	index: number
	label: string
	active: boolean | undefined
	isOpen: boolean | undefined
	href: string
	Icon: LucideIconName
	isActive: (menuPath: string) => boolean
}) {
	return (
		<div className="w-full" key={index}>
			<TooltipProvider disableHoverableContent>
				<Tooltip delayDuration={100}>
					<TooltipTrigger asChild>
						<Button
							variant={
								(active === undefined && isActive(href)) || active
									? 'secondary'
									: 'ghost'
							}
							className={cn(
								'w-full justify-start h-10 mb-1 dark:hover:bg-slate-800 hover:bg-slate-100',
								isActive(href)
									? 'text-primary dark:text-primary dark:bg-slate-800 bg-slate-100'
									: '',
							)}
							asChild
						>
							<Link href={href}>
								<span className={cn(isOpen === false ? '' : 'mr-4')}>
									<LucideIcon name={Icon} size={18} />
								</span>
								<p
									className={cn(
										'max-w-[200px] truncate',
										isOpen === false
											? '-translate-x-96 opacity-0'
											: 'translate-x-0 opacity-100',
									)}
								>
									{label}
								</p>
							</Link>
						</Button>
					</TooltipTrigger>
					{isOpen === false && (
						<TooltipContent side="right">{label}</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>
		</div>
	)
}
