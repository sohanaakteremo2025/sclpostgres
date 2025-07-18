'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Header } from '@/components/auth/auth-header'
import { Social } from '@/components/auth/social'
import { BackButton } from '@/components/auth/back-button'

interface CardWrapperProps {
	children: React.ReactNode
	headerLabel: string
	backButtonLabel: string
	backButtonHref: string
	showSocial?: boolean
}

export const AuthCardWrapper = ({
	children,
	backButtonLabel,
	backButtonHref,
	showSocial,
	headerLabel,
}: CardWrapperProps) => {
	return (
		<Card className="w-[400px] shadow-md">
			<CardHeader>
				<h2 className="text-sm text-center">{headerLabel}</h2>
				<Header />
			</CardHeader>
			<CardContent>{children}</CardContent>
			{showSocial && (
				<CardFooter>
					<Social />
				</CardFooter>
			)}
			<CardFooter>
				<BackButton label={backButtonLabel} href={backButtonHref} />
			</CardFooter>
		</Card>
	)
}
