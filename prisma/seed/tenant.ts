import { PrismaClient } from '@prisma/client'
import { SEED_CONFIG } from './config'
import { logProgress, createUserIfNotExists } from './utils'

const prisma = new PrismaClient()

export async function seedTenant() {
	try {
		logProgress('🏢 Starting tenant seeding')

		// Create or verify tenant exists
		const tenant = await prisma.tenant.upsert({
			where: { id: SEED_CONFIG.TENANT_ID },
			update: {},
			create: {
				id: SEED_CONFIG.TENANT_ID,
				logo: '/default-logo.png',
				name: 'Demo School',
				email: 'info@demoschool.edu',
				phone: '+8801712345678',
				address: 'Chittagong, Bangladesh',
				domain: 'demoschool',
				status: 'ACTIVE',
			},
		})

		// Create admin user
		await createUserIfNotExists({
			...SEED_CONFIG.defaultCredentials.admin,
			role: 'ADMIN',
			tenantId: tenant.id,
		})

		// Create transaction categories
		const categories = [
			'Student Fees',
			'Salary',
			'Utilities',
			'Maintenance',
			'Supplies',
		]
		for (const categoryTitle of categories) {
			await prisma.transactionCategory.upsert({
				where: {
					title_tenantId: {
						title: categoryTitle,
						tenantId: tenant.id,
					},
				},
				update: {},
				create: {
					title: categoryTitle,
					tenantId: tenant.id,
				},
			})
		}

		// Create default account
		await prisma.tenantAccount.upsert({
			where: {
				title_tenantId: {
					title: 'Main Account',
					tenantId: tenant.id,
				},
			},
			update: {},
			create: {
				title: 'Main Account',
				balance: 100000.0,
				tenantId: tenant.id,
			},
		})

		logProgress('✅ Tenant seeding completed', `Tenant: ${tenant.name}`)
		return tenant
	} catch (error: any) {
		logProgress('❌ Tenant seeding failed', error.message)
		throw error
	}
}
