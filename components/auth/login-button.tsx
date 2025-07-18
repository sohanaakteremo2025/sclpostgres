'use client'
import { useUser } from '@/context/user-context'
import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'

export default function CmsLoginButton() {
	const user = useUser()
	return (
		<div>
			{user && user.role === 'SUPER_ADMIN' ? (
				<Link href="/cms">
					<Button>Dashboard</Button>
				</Link>
			) : (
				<Link href="/login">
					<Button>Login</Button>
				</Link>
			)}
		</div>
	)
}
