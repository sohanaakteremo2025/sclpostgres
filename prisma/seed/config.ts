export const SEED_CONFIG = {
	// Default tenant ID for development
	TENANT_ID: '6a707dfe-cb36-4beb-b57e-2d2bd427c18d',

	// Environment settings
	environments: {
		development: {
			createTestData: true,
			studentCount: 50,
			employeeCount: 10,
			classCount: 5,
		},
		production: {
			createTestData: false,
			studentCount: 0,
			employeeCount: 0,
			classCount: 0,
		},
	},

	// Default user credentials
	defaultCredentials: {
		admin: {
			email: 'admin@school.com',
			password: 'admin123',
			name: 'System Administrator',
		},
		teacher: {
			email: 'teacher@school.com',
			password: 'teacher123',
			name: 'John Teacher',
		},
	},
}
