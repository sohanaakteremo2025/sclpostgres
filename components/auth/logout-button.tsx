'use client'

import { logout } from '@/lib/actions/logout.action'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
	children?: React.ReactNode
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
	const onClick = async () => {
		await logout()
	}

	return (
		<Button
			variant={'ghost'}
			onClick={onClick}
			className="cursor-pointer w-full flex items-center justify-start"
		>
			{children}
		</Button>
	)
}
