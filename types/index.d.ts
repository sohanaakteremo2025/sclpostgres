import { Prisma, UserRole } from '@prisma/client'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			photo?: string
			name: string
			email: string
			role: UserRole
			domain?: string
			tenantId?: string
		}
	}
	interface User {
		role: UserRole
		photo?: string
		domain?: string
		tenantId?: string
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		role: UserRole
		domain?: string
		tenantId?: string
	}
}

declare interface SidebarItem {
	icon?: React.ElementType
	label: string
	route: string
	children?: SidebarItem[]
}

declare interface IMenuGroup {
	name?: string
	isAdminOnly?: boolean
	isTeacherOnly?: boolean
	isStudentOnly?: boolean
	isEmployeeOnly?: boolean
	isCMSAdminOnly?: boolean
	menuItems: SidebarItem[]
}

export interface SearchParams {
	[key: string]: string | string[] | undefined
}

type TransactionClient = Prisma.TransactionClient
