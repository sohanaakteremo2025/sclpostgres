'use client'
import Link from 'next/link'
import { MenuIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { MenuList } from './menu-list'
import {
	Sheet,
	SheetHeader,
	SheetContent,
	SheetTrigger,
} from '@/components/ui/sheet'
import { MenuGroup } from './types'
import { Logo } from './Logo'
import { useState } from 'react'

export function MobileMenu({
	brand,
	menuGroup,
}: {
	brand: { name: string; logo: string }
	menuGroup: MenuGroup[]
}) {
	const [open, setOpen] = useState(false)

	const handleClose = () => {
		setOpen(false)
	}
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger className="lg:hidden" asChild>
				<Button className="h-8" variant="outline" size="icon">
					<MenuIcon size={20} />
				</Button>
			</SheetTrigger>
			<SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
				<SheetHeader>
					<Button
						className="flex justify-start pb-2 pt-1"
						variant="link"
						asChild
					>
						<Link href="/">
							<Logo
								title={brand?.name || ''}
								logoUrl={brand?.logo || ''}
								size="sm"
								variant="horizontal"
								maxTextLength={16}
							/>
						</Link>
					</Button>
				</SheetHeader>
				<MenuList isOpen closeMobileMenu={handleClose} menuGroup={menuGroup} />
			</SheetContent>
		</Sheet>
	)
}
