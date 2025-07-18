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
import { getAllClasses } from '@/lib/actions/class.action'
import { getAllSections } from '@/lib/actions/section.action'

interface Class {
	id: string
	name: string
}

interface Section {
	id: string
	name: string
	classId: string
}

interface ClassSectionFieldProps {
	form: any
	className?: string
}

export function ClassSectionField({ form, className }: ClassSectionFieldProps) {
	const [classes, setClasses] = useState<Class[]>([])
	const [allSections, setAllSections] = useState<Section[]>([])
	const [filteredSections, setFilteredSections] = useState<Section[]>([])

	const classId = form.watch('classId')

	// Load classes and validate default classId if exists
	useEffect(() => {
		const loadClasses = async () => {
			try {
				const classesData = await getAllClasses()
				setClasses(classesData)
			} catch (error) {
				console.error('Error loading classes:', error)
			}
		}

		loadClasses()
	}, [])

	// Load sections when class is selected or changes
	useEffect(() => {
		const loadSections = async () => {
			if (!classId) {
				setFilteredSections([])
				form.setValue('sectionId', '')
				return
			}

			try {
				const sectionsData: Section[] = await getAllSections()
				setAllSections(sectionsData)

				const sections = sectionsData.filter(
					section => section.classId === classId,
				)
				setFilteredSections(sections)

				// Check if current sectionId is valid for the selected class
				const currentSectionId = form.getValues('sectionId')
				if (
					currentSectionId &&
					!sections.some(section => section.id === currentSectionId)
				) {
					form.setValue('sectionId', '')
				}
			} catch (error) {
				console.error('Error loading sections:', error)
			}
		}

		loadSections()
	}, [classId, form])

	return (
		<div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
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
		</div>
	)
}
