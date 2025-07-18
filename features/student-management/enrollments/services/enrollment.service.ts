// features/class/services/classService.ts
import { CACHE_KEYS } from '@/constants/cache'
import { nextjsCacheService } from '@/lib/cache/nextjs-cache.service'
import { studentEnrollmentDB } from '../db/enrollment.repository'
import {
	CreateStudentEnrollmentPayload,
	UpdateStudentEnrollmentInput,
} from '@/lib/zod'

export async function createStudentEnrollmentService({
	data,
}: {
	data: CreateStudentEnrollmentPayload
}) {
	const result = await studentEnrollmentDB.create(data)

	// Cache invalidation through injected service
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_ENROLLMENTS.TAG(data.tenantId),
	])

	return result
}

export async function getAllStudentEnrollmentsService({
	tenantId,
}: {
	tenantId: string
}) {
	return await nextjsCacheService.cached(
		() => studentEnrollmentDB.getAllStudentEnrollments(tenantId),
		{
			key: CACHE_KEYS.STUDENT_ENROLLMENTS.KEY(tenantId),
			tags: [CACHE_KEYS.STUDENT_ENROLLMENTS.TAG(tenantId)],
			revalidate: 300, // 5 minutes
		},
	)
}

export async function getStudentEnrollmentByIdService({ id }: { id: string }) {
	return await nextjsCacheService.cached(
		() => studentEnrollmentDB.getStudentEnrollmentById(id),
		{
			key: CACHE_KEYS.STUDENT_ENROLLMENT.KEY(id),
			tags: [CACHE_KEYS.STUDENT_ENROLLMENT.TAG(id)],
			revalidate: 600, // 10 minutes
		},
	)
}

export async function getStudentEnrollmentByStudentIdService({
	studentId,
}: {
	studentId: string
}) {
	return await studentEnrollmentDB.getStudentEnrollmentByStudentId(studentId)
}

export async function updateStudentEnrollmentService({
	id,
	data,
}: {
	id: string
	data: UpdateStudentEnrollmentInput
}) {
	const existing = await studentEnrollmentDB.getStudentEnrollmentById(id)
	if (!existing) {
		throw new Error('Student Enrollment not found')
	}

	const result = await studentEnrollmentDB.update(id, data)

	// Invalidate relevant caches
	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_ENROLLMENTS.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_ENROLLMENT.TAG(id),
	])

	return result
}

export async function deleteStudentEnrollmentService({ id }: { id: string }) {
	const existing = await studentEnrollmentDB.getStudentEnrollmentById(id)
	if (!existing) {
		throw new Error('Student Enrollment not found')
	}

	await studentEnrollmentDB.delete(id)

	await nextjsCacheService.invalidate([
		CACHE_KEYS.STUDENT_ENROLLMENTS.TAG(existing.tenantId),
		CACHE_KEYS.STUDENT_ENROLLMENT.TAG(id),
	])
}
