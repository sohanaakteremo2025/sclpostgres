import { UserRole } from '@prisma/client'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Constants for route types and path patterns
 */
const ROUTES = {
	STATIC: ['/_next/', '/api/', '/favicon.ico'],
	AUTH: ['/login', '/register'],
	DASHBOARDS: {
		ADMIN: '/admin',
		STUDENT: '/student',
		TEACHER: '/teacher',
		EMPLOYEE: '/employee',
		SUPER_ADMIN: '/cms',
	},
	PROTECTED: ['/admin', '/student', '/teacher', '/employee'],
}

/**
 * Main middleware function for handling route protection, tenant isolation,
 * and role-based access control in a multi-tenant application.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
	const { pathname } = request.nextUrl
	const hostname = request.headers.get('host') || ''

	// Early return for static and API routes
	if (isStaticOrApiRoute(pathname)) {
		return NextResponse.next()
	}

	// Extract tenant information from the hostname
	const subdomain = extractSubdomain(hostname)

	// Handle institution routes without subdomain
	if (!subdomain && pathname.startsWith('/institution/')) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	// Get authenticated user information from JWT token
	const token = await getToken({
		req: request,
		secret: process.env.AUTH_SECRET,
		cookieName: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}session`,
	})

	// Extract user information
	const userInfo = {
		role: token?.role as UserRole | undefined,
		domain: token?.domain as string | undefined,
		subdomain: token?.domain as string | undefined,
		isAuthenticated: !!token,
		isSuperAdmin: token?.role === UserRole.SUPER_ADMIN,
		isTenantAdmin: token?.role === UserRole.ADMIN,
		tenantId: token?.tenantId as string | undefined,
	}

	// Check tenant billing status
	if (subdomain && userInfo.isTenantAdmin && pathname.includes('/admin') && userInfo.tenantId) {
		const response = await checkTenantBilling(
			request,
			subdomain,
			pathname,
			userInfo.tenantId,
		)
		if (response) {
			return response
		}
	}

	// 1. Handle CMS access (Super Admin only)
	if (pathname.startsWith(ROUTES.DASHBOARDS.SUPER_ADMIN)) {
		return handleCmsAccess(request, userInfo)
	}

	// 2. First check if this is a protected route, regardless of subdomain
	if (isProtectedRoute(pathname) && !userInfo.isAuthenticated) {
		const response = NextResponse.redirect(new URL('/login', request.url))
		if (subdomain) {
			addSubdomainHeaders(response, subdomain, hostname)
		}
		return response
	}

	// 3. Handle subdomain-based tenant routing
	if (subdomain) {
		// Rewrite subdomain routes to path-based tenant routes first
		if (!pathname.startsWith(`/institution/${subdomain}`)) {
			const response = rewriteSubdomainRoute(request, subdomain, pathname)

			// Add subdomain headers to maintain context
			addSubdomainHeaders(response, subdomain, hostname)

			// After rewriting, check if this is a tenant auth route
			const rewrittenPath = response.headers.get('x-middleware-rewrite')
			if (
				rewrittenPath &&
				isAuthRoute(rewrittenPath) &&
				userInfo.isAuthenticated
			) {
				const redirectResponse = redirectAuthenticatedUser(request, userInfo)
				addSubdomainHeaders(redirectResponse, subdomain, hostname)
				return redirectResponse
			}
			return response
		}

		// Prevent tenant mismatch (users accessing wrong institution)
		if (shouldPreventTenantMismatch(userInfo, subdomain, pathname)) {
			const response = redirectToUnauthorized(request)
			addSubdomainHeaders(response, subdomain, hostname)
			return response
		}

		// Check tenant auth routes after rewrite
		if (isAuthRoute(pathname) && userInfo.isAuthenticated) {
			const response = redirectAuthenticatedUser(request, userInfo)
			addSubdomainHeaders(response, subdomain, hostname)
			return response
		}
	}

	// 4. Handle main site auth routes (only for non-subdomain requests)
	if (!subdomain && isAuthRoute(pathname) && userInfo.isAuthenticated) {
		return redirectAuthenticatedUser(request, userInfo)
	}

	// 5. Handle role-based access control for institution routes
	if (pathname.includes('/institution/') && userInfo.isAuthenticated) {
		const response = handleRoleBasedAccess(request, pathname, userInfo)
		if (subdomain) {
			addSubdomainHeaders(response, subdomain, hostname)
		}
		return response
	}

	// Add subdomain headers to all responses for tenant context
	const response = NextResponse.next()
	if (subdomain) {
		addSubdomainHeaders(response, subdomain, hostname)
	}

	return response
}

// Helper Functions

// Check tenant billing status in middleware
async function checkTenantBilling(
	request: NextRequest,
	subdomain: string,
	pathname: string,
	tenantId: string,
): Promise<NextResponse | null> {
	// Skip billing check for billing-related pages and API routes
	const skipPaths = [
		'/billing',
		'/payment',
		'/api/payment',
		'/api/billing',
		'/api/webhooks',
		'/logout',
		'/error',
	]

	if (skipPaths.some(path => pathname.includes(path))) {
		return null
	}

	try {
		// Validate tenantId before making API call
		if (!tenantId || tenantId.trim() === '') {
			console.error('No tenantId provided for billing check')
			return null
		}

		// Make internal API call to check billing status
		const billingResponse = await fetch(
			`${request.nextUrl.origin}/api/billing/check/${tenantId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					// Forward auth cookies for internal API call
					Cookie: request.headers.get('cookie') || '',
				},
			},
		)

		if (!billingResponse.ok) {
			console.error(`Failed to check billing status in middleware: ${billingResponse.status} - ${billingResponse.statusText}`)
			return null // Allow access on API failure
		}

		const billingStatus = await billingResponse.json()

		if (billingStatus.isOverdue) {
			const url = request.nextUrl.clone()
			url.searchParams.set('isRedirected', 'true')
			url.pathname = `/institution/${subdomain}/billing/overdue`

			const response = NextResponse.redirect(url)
			addSubdomainHeaders(
				response,
				subdomain,
				request.headers.get('host') || '',
			)

			// Add billing info to headers for UI components
			response.headers.set('x-billing-status', 'overdue')
			response.headers.set(
				'x-days-overdue',
				billingStatus.daysOverdue.toString(),
			)
			response.headers.set(
				'x-total-overdue-amount',
				billingStatus.totalOverdueAmount.toString(),
			)
			response.headers.set(
				'x-overdue-schedules',
				encodeURIComponent(JSON.stringify(billingStatus.overdueSchedules)),
			)

			return response
		}
	} catch (error) {
		console.error('Billing check failed for tenant:', subdomain, error)
		// Allow access on billing check failure to avoid blocking legitimate users
	}

	return null
}

/**
 * Add subdomain context headers to maintain tenant information
 * across requests, redirects, and rewrites
 */
function addSubdomainHeaders(
	response: NextResponse,
	subdomain: string,
	hostname: string,
): void {
	// Method 1: Custom headers (accessible in pages/API routes)
	response.headers.set('x-tenant-subdomain', subdomain)

	// // Method 2: Set cookie for client-side access
	// response.cookies.set('tenant-subdomain', subdomain, {
	// 	name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}session`,
	// 	httpOnly: false, // Set to false for client-side access eg. userbutton
	// 	secure: process.env.NODE_ENV === 'production',
	// 	sameSite: 'lax',
	// 	path: '/',
	// 	maxAge: 60 * 60 * 24 * 7, // 7 days
	// })
}

/**
 * Enhanced subdomain extraction with better localhost handling
 */
function extractSubdomain(hostname: string): string | null {
	console.log(hostname)
	// Remove port if present
	const cleanHostname = hostname.split(':')[0]

	// Handle localhost development
	if (cleanHostname.endsWith('.localhost') || cleanHostname === 'localhost') {
		if (cleanHostname === 'localhost') {
			return null
		}
		const parts = cleanHostname.split('.')
		// Return everything before '.localhost'
		return parts.slice(0, -1).join('.')
	}

	// Handle vercel.app domains
	if (cleanHostname.endsWith('.vercel.app')) {
		const parts = cleanHostname.split('.')
		if (parts.length === 3) {
			// Format: subdomain.vercel.app
			return parts[0]
		}
		if (parts.length > 3) {
			// Format: multi.level.subdomain.vercel.app
			return parts.slice(0, -2).join('.')
		}
		return null
	}

	// Handle standard domains (assuming single TLD like .com, .org, etc.)
	const parts = cleanHostname.split('.')
	if (parts.length > 2) {
		// Remove 'www' if it's the only subdomain
		if (parts.length === 3 && parts[0] === 'www') {
			return null
		}
		// If www is present with other subdomains, remove it
		if (parts[0] === 'www') {
			const withoutWww = parts.slice(1)
			if (withoutWww.length > 2) {
				return withoutWww.slice(0, -2).join('.')
			}
			return null
		}
		// Return subdomain(s), excluding the last two parts (domain.tld)
		return parts.slice(0, -2).join('.')
	}

	return null
}

function isStaticOrApiRoute(pathname: string): boolean {
	return (
		ROUTES.STATIC.some(route => pathname.startsWith(route)) ||
		pathname.includes('.')
	)
}

function isAuthRoute(pathname: string): boolean {
	return ROUTES.AUTH.some(route => pathname.includes(route))
}

function isProtectedRoute(pathname: string): boolean {
	return ROUTES.PROTECTED.some(route => pathname.includes(route))
}

function getRoleDashboard(role: UserRole): string {
	const dashboardMap: Record<UserRole, string> = {
		ADMIN: 'admin',
		STUDENT: 'student',
		TEACHER: 'teacher',
		EMPLOYEE: 'employee',
		SUPER_ADMIN: 'admin',
		PRINCIPAL: 'admin',
		ACCOUNTANT: 'admin',
		LIBRARIAN: 'admin',
		STAFF: 'admin',
		WORKER: 'admin',
		SECURITY: 'admin',
		IT: 'admin',
		SUPERVISOR: 'admin',
		MARKETING: 'admin',
		HR: 'admin',
	}
	return dashboardMap[role] || ''
}

function handleCmsAccess(
	request: NextRequest,
	userInfo: { isSuperAdmin: boolean; isAuthenticated: boolean },
): NextResponse {
	console.log(userInfo)
	if (!userInfo.isAuthenticated || !userInfo.isSuperAdmin) {
		return NextResponse.redirect(new URL('/unauthorized', request.url))
	}
	return NextResponse.next()
}

function redirectToUnauthorized(request: NextRequest): NextResponse {
	return NextResponse.redirect(new URL('/unauthorized', request.url))
}

function shouldPreventTenantMismatch(
	userInfo: {
		role?: UserRole
		domain?: string
		subdomain?: string
		isSuperAdmin: boolean
	},
	subdomain: string,
	pathname: string,
): boolean {
	return (
		userInfo.role !== undefined &&
		!userInfo.isSuperAdmin &&
		(userInfo.domain || userInfo.subdomain) !== subdomain &&
		pathname.includes(`/institution/${subdomain}/`)
	)
}

function rewriteSubdomainRoute(
	request: NextRequest,
	subdomain: string,
	pathname: string,
): NextResponse {
	const url = request.nextUrl.clone()
	url.pathname =
		pathname === '/'
			? `/institution/${subdomain}`
			: `/institution/${subdomain}${pathname}`
	return NextResponse.rewrite(url)
}

function redirectAuthenticatedUser(
	request: NextRequest,
	userInfo: {
		role?: UserRole
		domain?: string
		subdomain?: string
		isSuperAdmin: boolean
		tenantId?: string
	},
): NextResponse {
	if (userInfo.isSuperAdmin) {
		return NextResponse.redirect(new URL('/cms', request.url))
	} else if (userInfo.role) {
		// Use the domain from the JWT token (which is the user's institution domain)
		const domain = userInfo.domain || userInfo.subdomain

		if (domain) {
			const dashboardPath = `/institution/${domain}/${getRoleDashboard(userInfo.role)}`
			return NextResponse.redirect(new URL(dashboardPath, request.url))
		} else {
			// If no domain is available, redirect to role-specific path without institution prefix
			const dashboardPath = `/${getRoleDashboard(userInfo.role)}`
			return NextResponse.redirect(new URL(dashboardPath, request.url))
		}
	}
	return NextResponse.redirect(new URL('/', request.url))
}

function handleRoleBasedAccess(
	request: NextRequest,
	pathname: string,
	userInfo: {
		role?: UserRole
		domain?: string
		subdomain?: string
		isSuperAdmin: boolean
	},
): NextResponse {
	const isAccessingWrongDashboard =
		(pathname.includes('/admin') && userInfo.role !== UserRole.ADMIN) ||
		(pathname.includes('/student') && userInfo.role !== UserRole.STUDENT) ||
		(pathname.includes('/teacher') && userInfo.role !== UserRole.TEACHER) ||
		(pathname.includes('/employee') && userInfo.role !== UserRole.EMPLOYEE)

	if (isAccessingWrongDashboard && !userInfo.isSuperAdmin) {
		const domain = userInfo.domain || userInfo.subdomain
		if (domain && userInfo.role) {
			const correctDashboard = `/institution/${domain}/${getRoleDashboard(userInfo.role)}`
			return NextResponse.redirect(new URL(correctDashboard, request.url))
		}
	}
	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
