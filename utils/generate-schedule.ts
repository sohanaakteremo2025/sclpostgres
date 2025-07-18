
// Match existing interfaces from the ClassSchedule component
interface Teacher {
	fullName: string
}

interface SectionDaysTeacher {
	class: string
	section: string
	days: string[]
	scheduleStart: string
	scheduleEnd: string
	teacher: Teacher
}

interface Subject {
	name: string
	sectionDaysTeachers: SectionDaysTeacher[]
}

/**
 * Generate a teacher object
 * @param fullName Full name of the teacher
 * @returns Teacher object
 */
export function createTeacher(fullName: string): Teacher {
	return { fullName }
}

/**
 * Create a Section Days Teacher entry
 * @param params Configuration for SectionDaysTeacher
 * @returns SectionDaysTeacher object
 */
export function createSectionDaysTeacher(params: {
	className: string
	section: string
	days?: string[]
	scheduleStart: string
	scheduleEnd: string
	teacherName: string
}): SectionDaysTeacher {
	return {
		class: params.className,
		section: params.section,
		days: params.days || ['Monday', 'Wednesday', 'Friday'],
		scheduleStart: params.scheduleStart,
		scheduleEnd: params.scheduleEnd,
		teacher: createTeacher(params.teacherName),
	}
}

/**
 * Create a Subject with SectionDaysTeachers
 * @param params Configuration for Subject
 * @returns Subject object
 */
export function createSubject(params: {
	name: string
	sectionDaysTeachers: SectionDaysTeacher[]
}): Subject {
	return {
		name: params.name,
		sectionDaysTeachers: params.sectionDaysTeachers,
	}
}

/**
 * Generate a complete schedule for a class
 * @param className Name of the class
 * @param section Section of the class
 * @param subjectConfigs Configuration for subjects
 * @returns Subject[] compatible with ClassSchedule
 */
export function generateClassSchedule(
	className: string,
	section: string,
	subjectConfigs: {
		name: string
		teacherName: string
		scheduleStart: string
		scheduleEnd: string
		days?: string[]
	}[],
): Subject[] {
	return subjectConfigs.map(config =>
		createSubject({
			name: config.name,
			sectionDaysTeachers: [
				createSectionDaysTeacher({
					className,
					section,
					teacherName: config.teacherName,
					scheduleStart: config.scheduleStart,
					scheduleEnd: config.scheduleEnd,
					days: config.days,
				}),
			],
		}),
	)
}

// /**
//  * Example usage function
//  */
// export function exampleScheduleGeneration() {
// 	// Generate a sample class schedule
// 	const mathSubject = createSubject({
// 		name: 'Mathematics',
// 		sectionDaysTeachers: [
// 			createSectionDaysTeacher({
// 				className: '10th Grade',
// 				section: 'A',
// 				teacherName: 'John Doe',
// 				scheduleStart: '09:00',
// 				scheduleEnd: '10:30',
// 				days: ['Monday', 'Wednesday'],
// 			}),
// 		],
// 	})

// 	// Full schedule generation example
// 	const fullSchedule = generateClassSchedule('10th Grade', 'A', [
// 		{
// 			name: 'Mathematics',
// 			teacherName: 'John Doe',
// 			scheduleStart: '09:00',
// 			scheduleEnd: '10:30',
// 		},
// 		{
// 			name: 'Science',
// 			teacherName: 'Jane Smith',
// 			scheduleStart: '11:00',
// 			scheduleEnd: '12:30',
// 		},
// 	])

// 	return { mathSubject, fullSchedule }
// }
