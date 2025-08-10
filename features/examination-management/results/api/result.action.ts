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
import { CACHE_KEYS } from '@/constants/cache'
import { revalidateTag } from 'next/cache'

export async function enterBulkResults(data: BulkResultInput) {
	const tenantId = await getTenantId()
	const session = await auth()
	if (!session?.user) {
		throw new Error('Unauthorized')
	}

	if (!tenantId) {
		throw new Error('Tenant ID not found')
	}

	const result = await enterBulkResultsService({
		...data,
		tenantId,
		enteredBy: session.user.name || session.user.email || 'Unknown',
	})

	// Invalidate related caches after entering results
	revalidateTag(CACHE_KEYS.EXAM_SCHEDULES.TAG(tenantId))
	revalidateTag(CACHE_KEYS.EXAM_RESULTS.TAG(tenantId))
	revalidateTag(CACHE_KEYS.EXAM_SCHEDULE.TAG(data.examScheduleId))

	return result
}
