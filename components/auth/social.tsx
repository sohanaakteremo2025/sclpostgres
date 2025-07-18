'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { Icon } from '@/components/icon'

export const Social = () => {
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl')

	const onClick = (provider: 'google' | 'github') => {
		signIn(provider, {
			callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
		})
	}

	return (
		<div className="flex items-center w-full gap-x-2">
			<Button
				size="lg"
				className="w-full"
				variant="outline"
				onClick={() => onClick('google')}
			>
				<Icon.google className="h-5 w-5" />
			</Button>
			<Button
				size="lg"
				className="w-full"
				variant="outline"
				onClick={() => onClick('github')}
			>
				<Icon.github className="h-5 w-5" />
			</Button>
		</div>
	)
}
