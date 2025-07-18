// components/Sidebar/Sidebar.tsx
'use client'
import { MenuList } from './menu-list'
import { SidebarToggle } from './sidebar-toggle'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import { useStore } from '@/hooks/use-store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { MenuGroup } from './types'
import { Logo } from '@/components/Sidebar/Logo'

interface Brand {
	name: string
	logo: string
}

export function Sidebar({
	menuGroup,
	brand,
}: {
	menuGroup: MenuGroup[]
	brand: Brand | null
}) {
	const sidebar = useStore(useSidebar, x => x)
	if (!sidebar) return null
	const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar

	return (
		<aside
			className={cn(
				'fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60',
				!getOpenState() ? 'w-[90px]' : 'w-72',
				settings.disabled && 'hidden',
			)}
		>
			<SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
			<div
				onMouseEnter={() => setIsHover(true)}
				onMouseLeave={() => setIsHover(false)}
				className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md bg-white dark:bg-slate-950"
			>
				<Button
					className={cn(
						'transition-transform ease-in-out duration-300 mb-1 h-auto',
						!getOpenState() ? 'translate-x-1 justify-center' : 'translate-x-0',
					)}
					variant="link"
					asChild
				>
					<Link href="/" className="flex items-center gap-2 w-full">
						{getOpenState() ? (
							<Logo
								title={brand?.name || ''}
								logoUrl={brand?.logo || ''}
								size="md"
								variant="horizontal"
								maxTextLength={16}
							/>
						) : (
							<Logo
								title={brand?.name || ''}
								logoUrl={brand?.logo || ''}
								size="sm"
								variant="logo-only"
								className="mx-auto"
							/>
						)}
					</Link>
				</Button>
				<MenuList isOpen={getOpenState()} menuGroup={menuGroup} />
			</div>
		</aside>
	)
}
