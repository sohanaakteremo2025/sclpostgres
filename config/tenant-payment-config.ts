// config/tenantPaymentConfig.ts

// Define the structure of payment method configuration
interface PaymentMethodConfig {
	enabled: boolean
	credentials?: {
		endpoint: string
		username: string
		password: string
		prefix: string
		return_url: string
	}
}

// Define the structure of a tenant's payment configurations
interface TenantPaymentConfig {
	shurjopay: PaymentMethodConfig
	// Add other payment methods here as needed
	// bkash: PaymentMethodConfig;
	// nagad: PaymentMethodConfig;
}

// Create a map of tenant subdomain to payment configurations
const tenantPaymentConfig: Record<string, TenantPaymentConfig> = {
	// School 1
	msimdhaka: {
		shurjopay: {
			enabled: true,
			credentials: {
				endpoint: 'https://engine.shurjopayment.com',
				username: 'markaz',
				password: 'markun#ws#zb&258',
				prefix: 'MRK',
				return_url: 'https://msimdhaka.campaas.net',
			},
		},
	},

	// School 2
	evergreen: {
		shurjopay: {
			enabled: true,
			credentials: {
				endpoint: 'https://sandbox.shurjopayment.com',
				username: 'sp_sandbox',
				password: 'pyyk97hu&6u6',
				prefix: 'SP',
				return_url: 'https://evergreen.campaas.net',
			},
		},
	},

	// Add more tenants as needed
}

/**
 * Check if a payment method is enabled for a specific tenant
 * @param tenantSubdomain The subdomain of the tenant
 * @param paymentMethod The payment method to check
 * @returns True if the payment method is enabled, false otherwise
 */
export function isPaymentMethodEnabled(
	tenantSubdomain: string,
	paymentMethod: keyof TenantPaymentConfig = 'shurjopay',
): boolean {
	const normalizedSubdomain = tenantSubdomain.toLowerCase()

	// Check if the tenant exists in the config
	if (!tenantPaymentConfig[normalizedSubdomain]) {
		return false
	}

	// Check if the payment method is enabled for this tenant
	return (
		tenantPaymentConfig[normalizedSubdomain][paymentMethod]?.enabled || false
	)
}

/**
 * Get the payment method credentials for a specific tenant
 * @param tenantSubdomain The subdomain of the tenant
 * @param paymentMethod The payment method to get credentials for
 * @returns The credentials object or null if not available
 */
export function getPaymentMethodCredentials(
	tenantSubdomain: string,
	paymentMethod: keyof TenantPaymentConfig = 'shurjopay',
) {
	const normalizedSubdomain = tenantSubdomain.toLowerCase()

	// Check if the tenant exists and has the payment method enabled
	if (!isPaymentMethodEnabled(normalizedSubdomain, paymentMethod)) {
		return null
	}

	// Return the credentials
	return (
		tenantPaymentConfig[normalizedSubdomain][paymentMethod]?.credentials || null
	)
}

/**
 * Get the tenant subdomain from the host
 * @param host The host string (e.g., "kam.domain.com")
 * @returns The tenant subdomain or null if not found
 */
export function getTenantSubdomainFromHost(host: string): string | null {
	if (!host) return null

	// For localhost development with port
	if (host.includes('localhost') || host.includes('127.0.0.1')) {
		const parts = host.split('.')
		if (parts.length >= 1) {
			return parts[0].split(':')[0] // Remove port if present
		}
		return null
	}

	// For production subdomain.domain.com
	const parts = host.split('.')
	if (parts.length >= 3) {
		return parts[0]
	}

	return null
}

// Export the config for direct access if needed
export default tenantPaymentConfig
