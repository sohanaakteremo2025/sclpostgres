'use client'

import { useTransition } from 'react'
import { login } from '@/lib/actions/login.action'
import { Button } from '@/components/ui/button'
import { redirect, useRouter } from 'next/navigation'

export default function ImpersonateButton({
	email,
	password,
}: {
	email: string
	password: string
}) {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const handleImpersonate = () => {
		startTransition(async () => {
			await login({ email, password })
			redirect('/login')
		})
	}

	return (
		<Button
			onClick={handleImpersonate}
			disabled={isPending}
			variant={'outline'}
			// className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
		>
			{isPending ? 'Logging in...' : 'Login account'}
		</Button>
	)
}
