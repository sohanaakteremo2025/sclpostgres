'use client'

import { createContext, useContext, ReactNode } from 'react'
import { UserSession } from '@/types/user'

interface UserContextType {
	user: UserSession | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
	children,
	user,
}: {
	children: ReactNode
	user: UserSession
}) {
	return (
		<UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
	)
}

// Helper hook to access the context
export function useUser() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider')
	}
	return context.user
}
