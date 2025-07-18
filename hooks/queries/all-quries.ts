'use client'
import { useQuery } from '@tanstack/react-query'
import { getAllClasses } from '@/features/academic-management/classes/api/class.action'
import { formatForSelect } from '@/utils/format-for-select'
import { getSectionsByClassId } from '@/features/academic-management/sections/api/section.action'
import {
	getStudentsBySectionId,
	getStudentsByClassId,
} from '@/features/student-management/students/api/student.action'
import { useEffect, useState } from 'react'

import { getAllSessions } from '@/features/academic-management/sessions/api/session.action'
import { getAllFeeStructures } from '@/features/financial-management/fee-structure/api/feestructure.action'
import { getAllTenants } from '@/features/cms-management/tenant/api/tenant.action'
import { getAllTransactionCategories } from '@/features/financial-management/transactionCategory/api/tenantAccount.action'
import { getAllTenantAccounts } from '@/features/financial-management/tenantAccount/api/tenantAccount.action'
import { getAllExams } from '@/lib/actions/exam.action'
import {
	getAllSubjects,
	getSubjectsByClassId,
	getSubjectsByClassOrSection,
	getSubjectsBySection,
} from '@/features/academic-management/subjects/api/subject.action'
import {
	getStudentDueById,
	getStudentDueByStudentId,
} from '@/features/financial-management/student-dues/api/studentDue.action'
import { getPaymentTransactionByStudentId } from '@/features/financial-management/payment-transaction/api/studentPayment.action'
import { getAllExamTypes } from '@/features/examination-management/exam-types/api/exam-types'
import {
	getAllEmployees,
	getEmployeeByRole,
} from '@/features/staff-management/employees/api/employee.action'
import { EmployeeRoleSchema } from '@/lib/zod'
import { getAllDiscountCategories } from '@/features/financial-management/dueAdjustment/api/dueAdjustment.action'
import { getAllFeeItemCategories } from '@/features/financial-management/dueItem/api/duitem.action'

export function useTeachers() {
	return useQuery({
		queryKey: ['teachers'],
		queryFn: () => getEmployeeByRole(EmployeeRoleSchema.enum.TEACHER),
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useSessions() {
	return useQuery({
		queryKey: ['sessions'],
		queryFn: getAllSessions,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useExamTypes() {
	return useQuery({
		queryKey: ['exam-types'],
		queryFn: getAllExamTypes,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useFeeStructures() {
	return useQuery({
		queryKey: ['fee-structure'],
		queryFn: getAllFeeStructures,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useClasses() {
	return useQuery({
		queryKey: ['classes'],
		queryFn: getAllClasses,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useSections(classId: string) {
	return useQuery({
		queryKey: ['sections', classId],
		queryFn: () => getSectionsByClassId(classId),
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useStudentsBySection(sectionId?: string) {
	return useQuery({
		queryKey: ['students', sectionId],
		queryFn: () => getStudentsBySectionId(sectionId!),
		select: formatForSelect,
		enabled: !!sectionId,
		staleTime: 2 * 60 * 1000, // Students change more frequently
	})
}

export function useStudentsByClass(classId?: string) {
	return useQuery({
		queryKey: ['students', 'class', classId],
		queryFn: () => getStudentsByClassId(classId!),
		select: formatForSelect,
		enabled: !!classId,
	})
}

export function useTenants() {
	return useQuery({
		queryKey: ['tenants-cms'],
		queryFn: getAllTenants,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

// tenant transactions

export function useTenantAccounts() {
	return useQuery({
		queryKey: ['tenant-accounts'],
		queryFn: getAllTenantAccounts,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useTenantTransactionCategories() {
	return useQuery({
		queryKey: ['tenant-transaction-categories'],
		queryFn: getAllTransactionCategories,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useDiscountCategories() {
	return useQuery({
		queryKey: ['discount-categories'],
		queryFn: getAllDiscountCategories,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useFeeItemCategories() {
	return useQuery({
		queryKey: ['fee-item-categories'],
		queryFn: getAllFeeItemCategories,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useTenantEmployees() {
	return useQuery({
		queryKey: ['tenant-employees'],
		queryFn: getAllEmployees,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useExams() {
	return useQuery({
		queryKey: ['exams'],
		queryFn: getAllExams,
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useStudentDues(studentId?: string) {
	return useQuery({
		queryKey: ['student-dues', studentId],
		queryFn: () => getStudentDueByStudentId(studentId!),
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

export function useStudentInvoices(studentId?: string) {
	return useQuery({
		queryKey: ['student-invoices', studentId],
		queryFn: () => getPaymentTransactionByStudentId(studentId!),
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

// Enhanced Class -> Section cascade
export function useClassSectionCascade() {
	const [selectedClassId, setSelectedClassId] = useState<string>('')
	const [selectedSectionId, setSelectedSectionId] = useState<string>('')

	const classes = useClasses()
	const sections = useSections(selectedClassId)
	const students = useStudentsBySection(selectedSectionId)

	// Reset dependent selects when parent changes
	useEffect(() => {
		setSelectedSectionId('')
	}, [selectedClassId])

	// Enhanced setters with validation
	const handleSetSelectedClassId = (classId: string) => {
		setSelectedClassId(classId)
		// Auto-reset dependent selections
		setSelectedSectionId('')
	}

	const handleSetSelectedSectionId = (sectionId: string) => {
		setSelectedSectionId(sectionId)
	}

	// Refetch functions with error handling
	const refetchClasses = async () => {
		try {
			return await classes.refetch()
		} catch (error) {
			console.error('Failed to refetch classes:', error)
			throw error
		}
	}

	const refetchSections = async () => {
		try {
			return await sections.refetch()
		} catch (error) {
			console.error('Failed to refetch sections:', error)
			throw error
		}
	}

	const refetchStudents = async () => {
		try {
			return await students.refetch()
		} catch (error) {
			console.error('Failed to refetch students:', error)
			throw error
		}
	}

	// Refetch all data in the cascade
	const refetchAll = async () => {
		try {
			await Promise.all([
				classes.refetch(),
				sections.refetch(),
				students.refetch(),
			])
		} catch (error) {
			console.error('Failed to refetch all cascade data:', error)
			throw error
		}
	}

	// Refetch cascade from a specific level down
	const refetchFromClasses = async () => {
		try {
			await classes.refetch()
			if (selectedClassId) {
				await sections.refetch()
				if (selectedSectionId) {
					await students.refetch()
				}
			}
		} catch (error) {
			console.error('Failed to refetch from classes:', error)
			throw error
		}
	}

	const refetchFromSections = async () => {
		try {
			await sections.refetch()
			if (selectedSectionId) {
				await students.refetch()
			}
		} catch (error) {
			console.error('Failed to refetch from sections:', error)
			throw error
		}
	}

	// Reset all selections
	const resetCascade = () => {
		setSelectedClassId('')
		setSelectedSectionId('')
	}

	return {
		// Data
		classes: classes.data || [],
		sections: sections.data || [],
		students: students.data || [],

		// Loading states
		isLoadingClasses: classes.isLoading,
		isLoadingSections: sections.isLoading,
		isLoadingStudents: students.isLoading,
		isLoading: classes.isLoading || sections.isLoading || students.isLoading,

		// Error states
		classesError: classes.error,
		sectionsError: sections.error,
		studentsError: students.error,
		hasError: !!(classes.error || sections.error || students.error),

		// Selected values
		selectedClassId,
		selectedSectionId,

		// Enhanced setters
		setSelectedClassId: handleSetSelectedClassId,
		setSelectedSectionId: handleSetSelectedSectionId,

		// Refetch functions
		refetchClasses,
		refetchSections,
		refetchStudents,
		refetchAll,
		refetchFromClasses,
		refetchFromSections,

		// Utility functions
		resetCascade,
		isReady: !classes.isLoading && !!classes.data,
		canSelectSection: !!selectedClassId && !sections.isLoading,
		canSelectStudent: !!selectedSectionId && !students.isLoading,
	}
}

// Enhanced useSubjects hook - handles both class-level and section-level subjects
export function useSubjects(classId?: string, sectionId?: string) {
	return useQuery({
		queryKey: ['subjects', classId, sectionId],
		queryFn: () => getSubjectsByClassOrSection(classId, sectionId),
		select: formatForSelect,
		staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
	})
}

// Alternative hook for class-only subjects (if you need both patterns)
export function useClassSubjects(classId?: string) {
	return useQuery({
		queryKey: ['class-subjects', classId],
		queryFn: () => getSubjectsByClassId(classId),
		select: formatForSelect,
		enabled: !!classId,
		staleTime: 10 * 60 * 1000,
	})
}

// Alternative hook for section-specific subjects
export function useSectionSubjects(sectionId?: string) {
	return useQuery({
		queryKey: ['section-subjects', sectionId],
		queryFn: () => getSubjectsBySection(sectionId),
		select: formatForSelect,
		enabled: !!sectionId,
		staleTime: 10 * 60 * 1000,
	})
}
// Complete Class -> Section -> Subject cascade
export function useClassSectionSubjectCascade() {
	const [selectedClassId, setSelectedClassId] = useState<string>('')
	const [selectedSectionId, setSelectedSectionId] = useState<string>('')
	const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')

	const classes = useClasses()
	const sections = useSections(selectedClassId)
	const subjects = useSubjects(selectedSectionId) // Passes both class and section

	// Reset dependent selects when parent changes
	useEffect(() => {
		setSelectedSectionId('')
		setSelectedSubjectId('')
	}, [selectedClassId])

	// Reset subject when section changes (since subjects might be different per section)
	useEffect(() => {
		setSelectedSubjectId('')
	}, [selectedSectionId])

	// Enhanced setters with validation and auto-reset
	const handleSetSelectedClassId = (classId: string) => {
		setSelectedClassId(classId)
		setSelectedSectionId('')
		setSelectedSubjectId('')
	}

	const handleSetSelectedSectionId = (sectionId: string) => {
		setSelectedSectionId(sectionId)
		setSelectedSubjectId('') // Reset subject when section changes
	}

	const handleSetSelectedSubjectId = (subjectId: string) => {
		setSelectedSubjectId(subjectId)
	}

	// Refetch functions with error handling
	const refetchClasses = async () => {
		try {
			return await classes.refetch()
		} catch (error) {
			console.error('Failed to refetch classes:', error)
			throw error
		}
	}

	const refetchSections = async () => {
		try {
			return await sections.refetch()
		} catch (error) {
			console.error('Failed to refetch sections:', error)
			throw error
		}
	}

	const refetchSubjects = async () => {
		try {
			return await subjects.refetch()
		} catch (error) {
			console.error('Failed to refetch subjects:', error)
			throw error
		}
	}

	// Refetch all data in the cascade
	const refetchAll = async () => {
		try {
			await Promise.all([
				classes.refetch(),
				sections.refetch(),
				subjects.refetch(),
			])
		} catch (error) {
			console.error('Failed to refetch all cascade data:', error)
			throw error
		}
	}

	// Refetch cascade from a specific level down
	const refetchFromClasses = async () => {
		try {
			await classes.refetch()
			if (selectedClassId) {
				await Promise.all([
					sections.refetch(),
					subjects.refetch(), // Will fetch subjects for current class/section combination
				])
			}
		} catch (error) {
			console.error('Failed to refetch from classes:', error)
			throw error
		}
	}

	const refetchFromSections = async () => {
		try {
			await sections.refetch()
			// Refetch subjects since they might change with section selection
			if (selectedClassId) {
				await subjects.refetch()
			}
		} catch (error) {
			console.error('Failed to refetch from sections:', error)
			throw error
		}
	}

	// Reset all selections
	const resetCascade = () => {
		setSelectedClassId('')
		setSelectedSectionId('')
		setSelectedSubjectId('')
	}

	// Validation helpers
	const isValidSelection = () => {
		return selectedClassId && selectedSubjectId
	}

	const getSelectedData = () => {
		const selectedClass = classes.data?.find(c => c.value === selectedClassId)
		const selectedSection = sections.data?.find(
			s => s.value === selectedSectionId,
		)
		const selectedSubject = subjects.data?.find(
			s => s.value === selectedSubjectId,
		)

		return {
			class: selectedClass,
			section: selectedSection,
			subject: selectedSubject,
		}
	}

	// Helper to determine if subjects are available
	const hasSubjects = subjects.data && subjects.data.length > 0
	const subjectRequiresSection =
		selectedClassId && !subjects.isLoading && !hasSubjects && !selectedSectionId

	return {
		// Data
		classes: classes.data || [],
		sections: sections.data || [],
		subjects: subjects.data || [],

		// Loading states
		isLoadingClasses: classes.isLoading,
		isLoadingSections: sections.isLoading,
		isLoadingSubjects: subjects.isLoading,
		isLoading: classes.isLoading || sections.isLoading || subjects.isLoading,

		// Error states
		classesError: classes.error,
		sectionsError: sections.error,
		subjectsError: subjects.error,
		hasError: !!(classes.error || sections.error || subjects.error),

		// Selected values
		selectedClassId,
		selectedSectionId,
		selectedSubjectId,

		// Enhanced setters
		setSelectedClassId: handleSetSelectedClassId,
		setSelectedSectionId: handleSetSelectedSectionId,
		setSelectedSubjectId: handleSetSelectedSubjectId,

		// Refetch functions
		refetchClasses,
		refetchSections,
		refetchSubjects,
		refetchAll,
		refetchFromClasses,
		refetchFromSections,

		// Utility functions
		resetCascade,
		isValidSelection,
		getSelectedData,
		isReady: !classes.isLoading && !!classes.data,
		canSelectSection: !!selectedClassId && !sections.isLoading,
		canSelectSubject: !!selectedClassId && !subjects.isLoading,

		// New helpers for hybrid subject system
		hasSubjects,
		subjectRequiresSection, // True if class is selected but no subjects available without section
		subjectsAvailable: hasSubjects, // Subjects are ready for selection
	}
}
