'use client'

type Action = 'DELETE' | 'UPDATE' | 'CREATE' | 'READ'

import { hasPermission } from '@/config/tenant-permissions'
import { useCurrentUser } from './use-current-user'

export default function usePermission(route: string, actions: Action[]) {
	const user = useCurrentUser()
	const role = user?.role as string
	const tenant =
		typeof window !== undefined ? window.location.hostname.split('.')[0] : ''
	const isPermitted = hasPermission(tenant, role, route, actions)
	return isPermitted
}
