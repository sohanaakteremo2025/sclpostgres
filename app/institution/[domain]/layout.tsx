import { getCachedTenantByDomain } from '@/lib/actions/tanant'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import { Toaster } from 'sonner'

// Generate metadata function for better SEO
export async function generateMetadata({
	params,
}: {
	params: Promise<{ domain: string }>
}): Promise<Metadata> {
	const { domain } = await params
	const tenant = await getCachedTenantByDomain(domain)

	if (!tenant) {
		return {
			title: 'Not Found',
			description: 'Tenant not found',
		}
	}

	// Create rich metadata
	const title = `${tenant.name} - School Management System`
	const description = `${tenant.name} located at ${tenant.address}. Comprehensive school management platform for students, teachers, and administration.`

	// Generate dynamic keywords based on tenant data and features
	const baseKeywords = [
		tenant.name,
		'school management system',
		'education platform',
		'student information system',
		'academic management',
		'online learning portal',
	]

	// Add location-based keywords
	const locationKeywords =
		tenant?.address
			?.split(',')
			?.map(part => part.trim())
			?.filter(Boolean)
			?.slice(0, 2) || [] // Take first 2 parts (usually city, state)

	// Add feature-based keywords based on relations
	const featureKeywords = []
	if (tenant.students?.length) featureKeywords.push('student enrollment')
	if (tenant.employees?.length) featureKeywords.push('staff management')
	if (tenant.classes?.length) featureKeywords.push('class scheduling')
	if (tenant.exams?.length) featureKeywords.push('examination system')
	if (tenant.feeStructures?.length) featureKeywords.push('fee management')
	if (tenant.notices?.length) featureKeywords.push('school announcements')

	const keywords = [...baseKeywords, ...locationKeywords, ...featureKeywords]
		.filter(Boolean)
		.join(', ')

	return {
		title,
		description,
		keywords,
		authors: [{ name: tenant?.name }],
		creator: tenant?.name,
		publisher: tenant?.name,

		// Favicon/Icons
		icons: {
			icon: [
				{
					url: tenant?.logo || '/favicon.ico',
					sizes: '32x32',
					type: 'image/x-icon',
				},
				{
					url: tenant?.logo || '/favicon-16x16.png',
					sizes: '16x16',
					type: 'image/png',
				},
				{
					url: tenant?.logo || '/favicon-32x32.png',
					sizes: '32x32',
					type: 'image/png',
				},
			],
			apple: [
				{
					url: tenant?.logo || '/apple-touch-icon.png',
					sizes: '180x180',
					type: 'image/png',
				},
			],
			shortcut: tenant?.logo || '/favicon.ico',
		},

		// Open Graph
		openGraph: {
			title,
			description,
			siteName: tenant?.name,
			locale: 'en_US',
			type: 'website',
			url: `https://${domain}`,
			images: [
				{
					url: tenant?.logo || '/default-school-logo.png',
					width: 1200,
					height: 630,
					alt: `${tenant?.name} Logo`,
				},
			],
		},

		// Twitter Card
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [tenant?.logo || '/default-school-logo.png'],
			creator: `@${tenant?.name?.replace(/\s+/g, '').toLowerCase()}`,
		},

		// Additional metadata
		robots: {
			index: tenant?.status === 'ACTIVE',
			follow: tenant?.status === 'ACTIVE',
			googleBot: {
				index: tenant?.status === 'ACTIVE',
				follow: tenant?.status === 'ACTIVE',
			},
		},

		// Verification and contact info
		other: {
			'contact:email': tenant?.email,
			'contact:phone': tenant?.phone,
			'business:contact_data:street_address': tenant?.address,
			'business:contact_data:locality': tenant?.address?.split(',')[0],
			'business:contact_data:website': `https://${domain}`,
		},

		// Canonical URL
		alternates: {
			canonical: `https://${domain}`,
		},
	}
}

export default async function TenantLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ domain: string }>
}) {
	const { domain } = await params
	const tenant = await getCachedTenantByDomain(domain)

	if (!tenant) {
		return notFound()
	}

	return (
		<html lang="en">
			<body>
				{/* Structured data for better SEO */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'EducationalOrganization',
							name: tenant?.name,
							url: `https://${domain}`,
							logo: tenant?.logo,
							description: `${tenant?.name}`,
							address: {
								'@type': 'PostalAddress',
								streetAddress: tenant?.address,
							},
							contactPoint: {
								'@type': 'ContactPoint',
								telephone: tenant?.phone,
								email: tenant?.email,
								contactType: 'customer service',
							},
							sameAs: [`https://${domain}`],
						}),
					}}
				/>
				{children}
				<Toaster richColors position="top-right" />
			</body>
		</html>
	)
}
