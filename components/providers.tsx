'use client'

import * as React from 'react'
import { NextUIProvider } from '@nextui-org/system'
import { useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
// import { ThemeProviderProps } from 'next-themes/dist/types'

export interface ProvidersProps {
	children: React.ReactNode
	// themeProps?: ThemeProviderProps
}

export function ThemeProvider({ children }: ProvidersProps) {
	const router = useRouter()

	return (
		<NextUIProvider navigate={router.push}>
			<NextThemesProvider attribute={'class'} defaultTheme="system">
				{children}
			</NextThemesProvider>
		</NextUIProvider>
	)
}
