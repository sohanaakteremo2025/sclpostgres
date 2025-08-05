'use server'
interface BulkResultInput {
	examScheduleId: string
	results: {
		studentId: string
		componentResults: {
			examComponentId: string
			obtainedMarks: number
			isAbsent?: boolean
			remarks?: string
		}[]
	}[]
}

import { getTenantId } from '@/lib/tenant'
import { enterBulkResultsService } from '../services/result.service'
import { auth } from '@/auth'

export async function enterBulkResults(data: BulkResultInput) {
	const tenantId = await getTenantId()
	const session = await auth()
	if (!session?.user) {
		throw new Error('Unauthorized')
	}

	if (!tenantId) {
		throw new Error('Tenant ID not found')
	}

	return await enterBulkResultsService({
		...data,
		tenantId,
		enteredBy: session.user.name || session.user.email || 'Unknown',
	})
}
