import { PrismaClient } from '@prisma/client'
import { seedStudent } from './student'
import { seedTenant } from './tenant'
import { seedEmployee } from './employee'

const prisma = new PrismaClient()

async function main() {
	try {
		console.log('🌱 Starting database seeding...\n')

		const environment = process.env.NODE_ENV || 'development'
		console.log(`Environment: ${environment}\n`)

		// Check if we're in production and require confirmation
		if (environment === 'production') {
			const shouldSeed = process.env.FORCE_SEED === 'true'
			if (!shouldSeed) {
				console.log(
					'❌ Production seeding requires FORCE_SEED=true environment variable',
				)
				process.exit(1)
			}
		}

		// Run seeds in order
		await seedTenant()
		await seedStudent()
		await seedEmployee()

		console.log('\n✅ Database seeding completed successfully!')
	} catch (error) {
		console.error('\n❌ Seeding failed:', error)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

main()
