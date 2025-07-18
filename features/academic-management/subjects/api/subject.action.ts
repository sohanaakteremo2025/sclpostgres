'use server'

import {
	CreateSubjectInput,
	CreateSubjectPayload,
	UpdateSubjectInput,
} from '@/lib/zod'
import {
	createSubjectService,
	getAllSubjectsService,
	getSubjectByIdService,
	updateSubjectService,
	deleteSubjectService,
	getSubjectsByClassOrSectionService,
	getSubjectsByClassIdService,
	getSubjectsBySectionService,
} from '../services/subject.service'

import { getTenantId } from '@/lib/tenant'

export async function createSubject(data: CreateSubjectInput) {
	const tenantId = await getTenantId()

	return await createSubjectService({ data: { ...data, tenantId } })
}

export async function getAllSubjects() {
	const tenantId = await getTenantId()

	return await getAllSubjectsService({
		tenantId,
	})
}

export async function getSubjectsByClassOrSection(
	classId?: string,
	sectionId?: string,
) {
	return await getSubjectsByClassOrSectionService({
		classId,
		sectionId,
	})
}

export async function getSubjectById(id: string) {
	return await getSubjectByIdService({
		id,
	})
}

export async function getSubjectsByClassId(classId?: string) {
	return await getSubjectsByClassIdService({
		classId,
	})
}

export async function getSubjectsBySection(sectionId?: string) {
	return await getSubjectsBySectionService({
		sectionId,
	})
}

export async function updateSubject(id: string, data: UpdateSubjectInput) {
	return await updateSubjectService({
		id,
		data,
	})
}

export async function deleteSubject(id: string) {
	return await deleteSubjectService({
		id,
	})
}
