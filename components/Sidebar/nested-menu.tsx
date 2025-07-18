'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, Dot } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from '@/components/ui/tooltip'
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { usePathname } from 'next/navigation'
import { Submenu, LucideIconName } from './types'
import LucideIcon from './LucideIcon'

interface CollapseMenuButtonProps {
	icon: LucideIconName
	label: string
	active?: boolean
	submenus: Submenu[]
	isOpen: boolean | undefined
	closeMobileMenu?: () => void
}

export function NestedMenu({
	icon: Icon,
	label,
	active,
	submenus,
	isOpen,
	closeMobileMenu,
}: CollapseMenuButtonProps) {
	const pathname = usePathname()

	// Check if any submenu is active (exact match only)
	const isSubmenuActive =
		active !== undefined
			? active
			: submenus.some(submenu =>
					submenu.active === undefined
						? pathname === submenu.href
						: submenu.active,
			  )

	const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive)

	return isOpen ? (
		<Collapsible
			open={isCollapsed}
			onOpenChange={setIsCollapsed}
			className="w-full"
		>
			<CollapsibleTrigger
				className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1"
				asChild
			>
				<Button
					variant={isSubmenuActive ? 'secondary' : 'ghost'}
					className={cn(
						'w-full justify-start h-10 hover:bg-slate-100 dark:hover:bg-slate-800',
						isSubmenuActive &&
							'text-primary dark:text-primary dark:bg-slate-800 bg-slate-100',
					)}
				>
					<div className="w-full items-center flex justify-between">
						<div className="flex items-center">
							<span className="mr-4">
								<LucideIcon name={Icon} size={18} />
							</span>
							<p
								className={cn(
									'max-w-[150px] truncate',
									isOpen
										? 'translate-x-0 opacity-100'
										: '-translate-x-96 opacity-0',
								)}
							>
								{label}
							</p>
						</div>
						<div
							className={cn(
								'whitespace-nowrap',
								isOpen
									? 'translate-x-0 opacity-100'
									: '-translate-x-96 opacity-0',
							)}
						>
							<ChevronDown
								size={18}
								className="transition-transform duration-200"
							/>
						</div>
					</div>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down pl-4">
				{submenus.map(({ href, label, active, icon: SubIcon }, index) => {
					const isActive = active ?? pathname === href
					return (
						<Button
							key={index}
							variant={isActive ? 'secondary' : 'ghost'}
							className={cn(
								'w-full justify-start h-10 mb-1 hover:bg-slate-100 dark:hover:bg-slate-800',
								isActive &&
									'text-primary dark:text-primary dark:bg-slate-800 bg-slate-100',
							)}
							asChild
						>
							<Link href={href} onClick={closeMobileMenu}>
								<span className="mr-4">
									{SubIcon ? (
										<LucideIcon name={SubIcon} size={18} />
									) : (
										<Dot size={18} />
									)}
								</span>
								<p
									className={cn(
										'max-w-[170px] truncate',
										isActive && 'text-primary dark:text-primary',
										isOpen
											? 'translate-x-0 opacity-100'
											: '-translate-x-96 opacity-0',
									)}
								>
									{label}
								</p>
							</Link>
						</Button>
					)
				})}
			</CollapsibleContent>
		</Collapsible>
	) : (
		<DropdownMenu>
			<TooltipProvider disableHoverableContent>
				<Tooltip delayDuration={100}>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								variant={isSubmenuActive ? 'secondary' : 'ghost'}
								className="w-full justify-start h-10 mb-1"
							>
								<div className="w-full items-center flex justify-between">
									<div
										className={cn(
											'flex items-center',
											isSubmenuActive && 'text-primary',
										)}
									>
										<span className={cn(isOpen === false ? '' : 'mr-4')}>
											<LucideIcon name={Icon} size={18} />
										</span>
										<p
											className={cn(
												'max-w-[200px] truncate',
												isSubmenuActive && 'text-primary',
												isOpen === false ? 'opacity-0' : 'opacity-100',
											)}
										>
											{label}
										</p>
									</div>
								</div>
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent side="right" align="start" alignOffset={2}>
						{label}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<DropdownMenuContent side="right" sideOffset={25} align="start">
				<DropdownMenuLabel className="max-w-[190px] truncate">
					{label}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{submenus.map(({ href, label, active }, index) => {
					const isActive = (active === undefined && pathname === href) || active
					return (
						<DropdownMenuItem key={index} asChild>
							<Link
								className={cn(
									'cursor-pointer w-full',
									isActive ? 'bg-secondary text-primary' : '',
								)}
								href={href}
							>
								<p className="max-w-[180px] truncate">{label}</p>
							</Link>
						</DropdownMenuItem>
					)
				})}
				<DropdownMenuArrow className="fill-border" />
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
