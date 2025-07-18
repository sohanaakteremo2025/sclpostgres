'use client'
import { useEffect, useState } from 'react'
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useTenantStore } from '@/store/datastore'

interface Class {
	id: string
	name: string
}

interface Section {
	id: string
	name: string
	classId: string
}

interface Student {
	id: string
	fullName: string
	classId: string
	sectionId: string
	studentId: string
}

interface StudentSelectionFieldProps {
	form: any
	className?: string
}

export function StudentSelectionField({
	form,
	className = '',
}: StudentSelectionFieldProps) {
	const {
		classes: classesData,
		sections: sectionsData,
		students: studentsData,
		fetchClasses,
		fetchSections,
		fetchStudents,
	} = useTenantStore()
	useEffect(() => {
		fetchClasses()
		fetchSections()
		fetchStudents()
	}, [fetchClasses, fetchSections, fetchStudents])
	// State for storing all data
	const [classes, setClasses] = useState<Class[]>([])
	const [sections, setSections] = useState<Section[]>([])
	const [students, setStudents] = useState<Student[]>([])

	useEffect(() => {
		setClasses(Object.values(classesData))
		setSections(Object.values(sectionsData))
		setStudents(Object.values(studentsData))
	}, [classesData, sectionsData, studentsData])

	// Filtered state
	const [filteredSections, setFilteredSections] = useState<Section[]>([])
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([])

	// Track loading states
	const [isClassLoaded, setIsClassLoaded] = useState(false)
	const [isSectionLoaded, setIsSectionLoaded] = useState(false)

	const classId = form.watch('classId')
	const sectionId = form.watch('sectionId')

	// First: Load classes and handle default class
	useEffect(() => {
		const loadClasses = async () => {
			try {
				// Check if there's a default classId in the form
				const defaultClassId = form.getValues('classId')
				if (
					defaultClassId &&
					!isClassLoaded &&
					classes.some(cls => cls.id === defaultClassId)
				) {
					setIsClassLoaded(true)
				}
			} catch (error) {
				console.error('Error loading classes:', error)
			}
		}

		loadClasses()
	}, [form, isClassLoaded])

	// Second: Load sections after class is selected
	useEffect(() => {
		const loadSections = async () => {
			if (!classId) return

			try {
				const sectionsData = sections.filter(
					section => section.classId === classId,
				)
				setFilteredSections(sectionsData)

				// Check if there's a default sectionId in the form
				const defaultSectionId = form.getValues('sectionId')
				if (
					defaultSectionId &&
					!isSectionLoaded &&
					sections.some(section => section.id === defaultSectionId)
				) {
					setIsSectionLoaded(true)
				} else if (
					sectionId &&
					!sections.some(section => section.id === sectionId)
				) {
					form.setValue('sectionId', '')
				}
			} catch (error) {
				console.error('Error loading sections:', error)
			}
		}

		loadSections()
	}, [classId, form, isSectionLoaded, sectionId])

	// Third: Load students after both class and section are selected
	useEffect(() => {
		const loadStudents = async () => {
			if (!classId || !sectionId) {
				setFilteredStudents([])
				form.setValue('studentId', '')
				return
			}

			try {
				const studentsData = students.filter(
					student =>
						student.classId === classId && student.sectionId === sectionId,
				)
				setFilteredStudents(studentsData)

				// Check if current studentId is valid for the selected class and section
				const currentStudentId = form.getValues('studentId')
				if (
					currentStudentId &&
					!students.some(student => student.id === currentStudentId)
				) {
					form.setValue('studentId', '')
				}
			} catch (error) {
				console.error('Error loading students:', error)
			}
		}

		loadStudents()
	}, [classId, sectionId, form])

	return (
		<div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
			<FormField
				control={form.control}
				name="classId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Class</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Select a class" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{classes.map(cls => (
									<SelectItem key={cls.id} value={cls.id}>
										{cls.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="sectionId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Section</FormLabel>
						<Select
							onValueChange={field.onChange}
							value={field.value}
							disabled={!classId}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Select a section" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{filteredSections.map(section => (
									<SelectItem key={section.id} value={section.id}>
										{section.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="studentId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Student</FormLabel>
						<Select
							onValueChange={field.onChange}
							value={field.value}
							disabled={!sectionId}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Select a student" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{filteredStudents.map(student => (
									<SelectItem key={student.id} value={student.id}>
										{student.studentId}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
