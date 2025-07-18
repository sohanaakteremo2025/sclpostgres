// Helper function to extract role from path
function getRoleFromPath(path: string): string | null {
	const pathLower = path.toLowerCase()
	console.log(pathLower)
	//cms admin check must be first because it also might includes /admin
	if (pathLower.includes('/cms')) return 'cmsAdmin'
	if (pathLower.includes('/admin')) return 'admin'
	if (pathLower.includes('/teacher')) return 'teacher'
	if (pathLower.includes('/student')) return 'student'
	if (pathLower.includes('/employee')) return 'employee'

	return null
}

// Main permission check function
export function hasRoutePermission(path: string, userRole: string) {
	if (userRole === 'superAdmin') return true
	const requiredRole = getRoleFromPath(path)
	if (!requiredRole) return true
	// Check if user has the required role
	if (userRole === 'cmsAdmin' && !path.includes('/cms')) return false
	return userRole === requiredRole
}
