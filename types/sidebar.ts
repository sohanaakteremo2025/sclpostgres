export interface SidebarProps {
	sidebarOpen: boolean
	setSidebarOpen: (open: boolean) => void
}

export interface MenuItem {
	icon: React.ElementType
	label: string
	route: string
	children?: MenuItem[]
}

export interface MenuGroup {
	name?: string
	isCMSAdminOnly?: boolean
	isAdminOnly?: boolean
	isTeacherOnly?: boolean
	isStudentOnly?: boolean
	isEmployeeOnly?: boolean
	menuItems: MenuItem[]
}

export interface DropdownMenuProps {
	children: MenuItem[]
	pathname: string
}

export interface SidebarItemProps {
	item: MenuItem
	isActive: boolean
	isOpen: boolean
	onToggle: () => void
}

export interface MenuGroupProps {
	group: MenuGroup
	pageName: string
	setPageName: (name: string) => void
	pathname: string
	isItemActive: (item: MenuItem) => boolean
}
