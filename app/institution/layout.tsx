import '@/styles/globals.css'
import { fontSans } from '@/config/fonts'
import { Toaster } from 'sonner'

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html suppressHydrationWarning lang="en">
			<body className={fontSans.className}>
				<div className="">
					<main className="">{children}</main>
					<Toaster position="top-right" richColors />
				</div>
			</body>
		</html>
	)
}
