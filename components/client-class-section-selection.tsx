'use client'
import React from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Class {
	id: string
	name: string
}

interface Section {
	id: string
	name: string
	classId: string
}

interface ClassSectionSelectorProps {
	classes: Class[]
	sections: Section[]
	onSelect: (classId: string, sectionId: string) => void
}

export function ClientClassSectionSelector({
	classes,
	sections,
	onSelect,
}: ClassSectionSelectorProps) {
	const [selectedClassId, setSelectedClassId] = React.useState<string>('')
	const [selectedSectionId, setSelectedSectionId] = React.useState<string>('')

	const handleClassChange = (value: string) => {
		setSelectedClassId(value)
		setSelectedSectionId('') // Reset section selection on class change
		const filteredSections = sections.filter(
			section => section.classId === value,
		)
		if (filteredSections.length > 0) {
			const defaultSectionId = filteredSections[0].id
			setSelectedSectionId(defaultSectionId)
			onSelect(value, defaultSectionId) // Trigger onSelect with default section
		}
	}

	const handleSectionChange = (value: string) => {
		setSelectedSectionId(value)
		if (selectedClassId) {
			onSelect(selectedClassId, value)
		}
	}

	return (
		<div className="flex items-center gap-5">
			<div className="space-y-2 w-full">
				<Label htmlFor="class-select">Select Class</Label>
				<Select value={selectedClassId} onValueChange={handleClassChange}>
					<SelectTrigger id="class-select">
						<SelectValue placeholder="Select a class" />
					</SelectTrigger>
					<SelectContent>
						{classes.map(cls => (
							<SelectItem key={cls.id} value={cls.id}>
								{cls.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{selectedClassId && (
				<div className="space-y-2 w-full">
					<Label htmlFor="section-select">Select Section</Label>
					<Select value={selectedSectionId} onValueChange={handleSectionChange}>
						<SelectTrigger id="section-select">
							<SelectValue placeholder="Select a section" />
						</SelectTrigger>
						<SelectContent>
							{sections
								.filter(section => section.classId === selectedClassId)
								.map(section => (
									<SelectItem key={section.id} value={section.id}>
										{section.name}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	)
}
