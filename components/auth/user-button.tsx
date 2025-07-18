'use client'

import { ExitIcon } from '@radix-ui/react-icons'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogoutButton } from '@/components/auth/logout-button'
import { useUser } from '@/context/user-context'
import { UserAvatar } from '../user-avatar'

export const UserButton = () => {
	const user = useUser()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<UserAvatar src={user?.photo || ''} firstName={user?.name || ''} />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40" align="end">
				<LogoutButton>
					<ExitIcon className="h-4 w-4 mr-2" />
					Logout
				</LogoutButton>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
