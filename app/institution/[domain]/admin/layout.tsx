import React from 'react'

import DashboardLayout from '@/components/Sidebar/dashboard-layout'
import { adminMenu } from '@/constants/constants'
import { getCachedTenantLogoByDomain } from '@/lib/actions/tanant'
export default async function AdminLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ domain: string }>
}) {
	const { domain } = await params
	const tenant = await getCachedTenantLogoByDomain(domain)
	const TenantBrand = { name: tenant?.name || '', logo: tenant?.logo || '' }
	return (
		<DashboardLayout brand={TenantBrand} menuGroup={adminMenu}>
			{children}
		</DashboardLayout>
	)
}
