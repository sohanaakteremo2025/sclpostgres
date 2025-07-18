'use client'

import { Ellipsis, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from '@/components/ui/tooltip'
import { MenuGroup } from './types'
import { SingleMenu } from './single-menu'
import { NestedMenu } from './nested-menu'
import { signOut } from 'next-auth/react'

interface MenuProps {
	isOpen: boolean | undefined
	menuGroup: MenuGroup[]
	closeMobileMenu?: () => void
}

export function MenuList({ isOpen, menuGroup, closeMobileMenu }: MenuProps) {
	const pathname = usePathname()

	// Universal solution - only active for exact matches
	const isActive = (menuPath: string) => {
		return pathname === menuPath
	}

	const handleLogout = () => {
		signOut({ callbackUrl: '/' }) // Redirect to home page after logout
	}

	return (
		<ScrollArea className="[&>div>div[style]]:!block">
			<nav className="mt-8 h-full w-full">
				<ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
					{menuGroup.map(({ groupLabel, menus }, index) => (
						<li className={cn('w-full', groupLabel ? 'pt-5' : '')} key={index}>
							{(isOpen && groupLabel) || isOpen === undefined ? (
								<p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
									{groupLabel}
								</p>
							) : !isOpen && isOpen !== undefined && groupLabel ? (
								<TooltipProvider>
									<Tooltip delayDuration={100}>
										<TooltipTrigger className="w-full">
											<div className="w-full flex justify-center items-center">
												<Ellipsis className="h-5 w-5" />
											</div>
										</TooltipTrigger>
										<TooltipContent side="right">
											<p>{groupLabel}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							) : (
								<p className="pb-2"></p>
							)}
							{menus.map(
								({ href, label, icon: Icon, active, submenus }, index) =>
									!submenus || submenus.length === 0 ? (
										<div key={index} onClick={closeMobileMenu}>
											<SingleMenu
												index={index}
												label={label}
												active={active}
												isOpen={isOpen}
												href={href}
												Icon={Icon}
												isActive={isActive}
											/>
										</div>
									) : (
										<div className="w-full" key={index}>
											<NestedMenu
												closeMobileMenu={closeMobileMenu}
												icon={Icon}
												label={label}
												active={
													active === undefined
														? submenus.some(sub => isActive(sub.href))
														: active
												}
												submenus={submenus}
												isOpen={isOpen}
											/>
										</div>
									),
							)}
						</li>
					))}
					<li className="w-full grow flex items-end">
						<TooltipProvider disableHoverableContent>
							<Tooltip delayDuration={100}>
								<TooltipTrigger asChild>
									<Button
										onClick={handleLogout}
										variant="outline"
										className="w-full justify-center h-10 mt-5"
									>
										<span className={cn(isOpen === false ? '' : 'mr-4')}>
											<LogOut size={18} />
										</span>
										<p
											className={cn(
												'whitespace-nowrap',
												isOpen === false ? 'opacity-0 hidden' : 'opacity-100',
											)}
										>
											Sign out
										</p>
									</Button>
								</TooltipTrigger>
								{isOpen === false && (
									<TooltipContent side="right">Sign out</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					</li>
				</ul>
			</nav>
		</ScrollArea>
	)
}
