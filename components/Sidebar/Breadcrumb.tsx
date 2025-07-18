import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

// Define the BreadcrumbItem type
export interface BreadcrumbItem {
	label: string
	href: string
	isCurrent?: boolean
}

// Define the Breadcrumb props
export interface BreadcrumbProps {
	items: BreadcrumbItem[]
	homeHref?: string
	showHomeIcon?: boolean
}

// Breadcrumb component
export function Breadcrumb({
	items,
	homeHref = '/',
	showHomeIcon = true,
}: BreadcrumbProps) {
	return (
		<nav className="flex" aria-label="Breadcrumb">
			<ol className="flex items-center space-x-1 text-sm">
				{showHomeIcon && (
					<li>
						<a
							href={homeHref}
							className="text-muted-foreground hover:text-foreground flex items-center"
						>
							<Home className="h-4 w-4" />
						</a>
					</li>
				)}

				{items.map((item, index) => (
					<li key={index} className="flex items-center">
						{(index > 0 || showHomeIcon) && (
							<ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
						)}

						<a
							href={item.href}
							className={`${
								item.isCurrent
									? 'font-medium text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							}`}
							aria-current={item.isCurrent ? 'page' : undefined}
						>
							{item.label}
						</a>
					</li>
				))}
			</ol>
		</nav>
	)
}
