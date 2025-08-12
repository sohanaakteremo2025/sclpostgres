'use server'

import { getTenantId } from '@/lib/tenant'
import { 
	ensureStudentDuesUpToDate,
	generateMissingDuesForClassSection 
} from '../services/auto-dues-generation.service'

export async function ensureStudentDuesUpToDateAction(studentId: string) {
	try {
		const tenantId = await getTenantId()
		const result = await ensureStudentDuesUpToDate(studentId, tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in ensureStudentDuesUpToDateAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

export async function generateMissingDuesForClassSectionAction(
	classId?: string,
	sectionId?: string
) {
	try {
		const tenantId = await getTenantId()
		const result = await generateMissingDuesForClassSection(classId, sectionId, tenantId)
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		console.error('Error in generateMissingDuesForClassSectionAction:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}