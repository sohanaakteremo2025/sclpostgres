export interface Subject {
	id: string
	name: string
	class: string
	section: string
	teacher: string
	schedule: string
}

export function getUniqueClassesAndSections(subjects: Subject[]) {
	const classes = Array.from(new Set(subjects.map(subject => subject.class)))
	const sections = Array.from(new Set(subjects.map(subject => subject.section)))
	return { classes, sections }
}

export function getFilteredAndGroupedSubjects(
	subjects: Subject[],
	selectedClass: string,
	selectedSection: string,
) {
	const filteredSubjects = subjects.filter(
		subject =>
			subject.class === selectedClass && subject.section === selectedSection,
	)

	const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
		if (!acc[subject.schedule]) {
			acc[subject.schedule] = []
		}
		acc[subject.schedule].push(subject)
		return acc
	}, {} as Record<string, Subject[]>)

	return Object.entries(groupedSubjects).sort((a, b) => a[0].localeCompare(b[0]))
}
