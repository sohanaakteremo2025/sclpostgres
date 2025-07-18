import * as LucideIcons from 'lucide-react'

export type LucideIconName = keyof typeof LucideIcons

export type Submenu = {
	href: string
	label: string
	active?: boolean
	icon?: LucideIconName
}

type Menu = {
	href: string
	label: string
	icon: LucideIconName
	active?: boolean
	submenus?: Submenu[]
}

export type MenuGroup = {
	groupLabel: string
	menus: Menu[]
}
