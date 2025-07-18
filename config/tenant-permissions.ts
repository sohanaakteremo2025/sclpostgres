// Define types for the permissions structure
type Action = 'DELETE' | 'UPDATE' | 'CREATE' | 'READ'

// Define the permission structure that supports multiple roles
interface TenantPermissionsType {
	[tenant: string]: {
		[role: string]: {
			[route: string]: Action[]
		}
	}
}

// Example permission configuration with multiple roles
const tenantPermissionsLocal: TenantPermissionsType = {
	msimdhaka: {
		admin: {
			student: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			fees: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			transaction: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			feesStructure: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			salary: ['DELETE', 'UPDATE'],
		},
	},
	evergreen: {
		admin: {
			student: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			fees: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			transaction: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			feesStructure: ['DELETE', 'UPDATE', 'CREATE', 'READ'],
			salary: ['DELETE', 'UPDATE'],
		},
	},
}

/**
 * Checks if a user has permission to perform specific actions on a route
 * @param tenant The tenant identifier
 * @param role The user's role
 * @param route The route to check permissions for
 * @param actions Single action or array of actions to check
 * @returns boolean indicating if the user has all the requested permissions
 */
export function hasPermission(
	tenant: string,
	role: string,
	route: string,
	actions: Action | Action[],
): boolean {
	if (role === 'admin') {
		return true
	}
	// Check if tenant exists
	if (!tenantPermissionsLocal[tenant]) {
		return false
	}

	// Check if role exists for this tenant
	if (!tenantPermissionsLocal[tenant][role]) {
		return false
	}

	// Check if route exists for this role
	if (!tenantPermissionsLocal[tenant][role][route]) {
		return false
	}

	// Convert single action to array if needed
	const actionArray = Array.isArray(actions) ? actions : [actions]

	// Check if all requested actions are allowed
	return actionArray.every(action =>
		tenantPermissionsLocal[tenant][role][route].includes(action),
	)
}
