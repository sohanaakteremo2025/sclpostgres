import '@/styles/globals.css'
import { fontSans } from '@/config/fonts'
import { auth } from '@/auth'
import { ThemeProvider } from '@/components/providers'
import { UserProvider } from '@/context/user-context'
import { SessionProvider } from 'next-auth/react'
import { UserSession } from '@/types/user'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactQueryProvider } from '@/providers/react-query'

export const metadata = {
	title: 'Institution Portal',
	description: 'Institution Portal',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await auth()
	const user = session?.user

	return (
		<SessionProvider
			session={session}
			refetchInterval={0}
			refetchOnWindowFocus={true}
		>
			<UserProvider user={user as UserSession}>
				<html suppressHydrationWarning lang="en">
					<body className={fontSans.className}>
						<div className="">
							<main className="">
								<ThemeProvider>
									<NuqsAdapter>
										<ReactQueryProvider>{children}</ReactQueryProvider>
									</NuqsAdapter>
								</ThemeProvider>
							</main>
						</div>
					</body>
				</html>
			</UserProvider>
		</SessionProvider>
	)
}
