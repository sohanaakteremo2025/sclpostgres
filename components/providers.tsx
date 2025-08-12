'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export interface ProvidersProps {
	children: React.ReactNode
}

export function ThemeProvider({ children }: ProvidersProps) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</NextThemesProvider>
	)
}
