import React from 'react'

import DashboardLayout from '@/components/Sidebar/dashboard-layout'
import { cmsMenu } from '@/constants/constants'

export default async function DefaultLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const CMSBrand = {
		name: 'CMS Panel',
		logo: '/company/logo.png',
	}

	return (
		<DashboardLayout brand={CMSBrand} menuGroup={cmsMenu}>
			{children}
		</DashboardLayout>
	)
}
