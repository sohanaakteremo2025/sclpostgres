// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { salaryDB } from '../db/salarie.repository'
import {
	CreateTenantSalaryItemPayload,
	UpdateTenantSalaryItemInput,
} from '@/lib/zod'

export async function createSalaryService({
	data,
}: {
	data: CreateTenantSalaryItemPayload
}) {
	const result = await salaryDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.SALARIES.TAG(data.salaryStructureId),
	])

	return result
}

export async function getAllSalariesService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => salaryDB.getAllSalaries(tenantId),
		{
			key: CACHE_KEYS.SALARIES.KEY(tenantId),
			tags: [CACHE_KEYS.SALARIES.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getSalaryByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(() => salaryDB.getSalaryById(id), {
		key: CACHE_KEYS.SALARIES.KEY(id),
		tags: [CACHE_KEYS.SALARIES.TAG(id)],
		revalidate: 600, // 10 minutes
	})
}

export async function updateSalaryService({
	id,
	data,
}: {
	id: string
	data: UpdateTenantSalaryItemInput
}) {
	const existing = await salaryDB.getSalaryById(id)
	if (!existing) {
		throw new Error('Salary not found')
	}

	const result = await salaryDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.SALARIES.TAG(existing.salaryStructureId),
		CACHE_KEYS.SALARY.TAG(id),
	])

	return result
}

export async function deleteSalaryService({ id }: { id: string }) {
	const existing = await salaryDB.getSalaryById(id)
	if (!existing) {
		throw new Error('Salary not found')
	}

	await salaryDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.SALARIES.TAG(existing.salaryStructureId),
		CACHE_KEYS.SALARY.TAG(id),
	])
}
