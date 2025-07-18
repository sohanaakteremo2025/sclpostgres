type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' | 'Unknown'

interface GradeResult {
	grade: Grade
	percentage: number
	isPassing: boolean
	gradeColor: string
}

/**
 * Calculates academic grade based on score obtained and total marks
 * @param scoreObtained - The marks obtained by the student
 * @param totalMarks - The total maximum marks possible
 * @returns GradeResult object containing grade, percentage and passing status
 * @throws Error if invalid input is provided
 */
export function calculateGrade(
	scoreObtained: number,
	totalMarks: number,
): GradeResult {
	// Input validation
	if (scoreObtained > totalMarks) {
		return {
			grade: 'Unknown',
			percentage: 0,
			isPassing: false,
			gradeColor: 'bg-gray-500',
		}
	}

	// Calculate percentage
	const percentage = (scoreObtained / totalMarks) * 100

	// Fail condition - less than one-third marks
	if (percentage < 33.33) {
		return {
			grade: 'F',
			percentage: percentage,
			isPassing: false,
			gradeColor: getGradeColor('F'),
		}
	}

	// Grade calculation based on percentage ranges
	let grade: Grade
	if (percentage >= 80) {
		grade = 'A+'
	} else if (percentage >= 70) {
		grade = 'A'
	} else if (percentage >= 60) {
		grade = 'B+'
	} else if (percentage >= 50) {
		grade = 'B'
	} else if (percentage >= 50) {
		grade = 'C+'
	} else if (percentage >= 40) {
		grade = 'C'
	} else if (percentage >= 33.33) {
		grade = 'D'
	} else {
		grade = 'F'
	}

	return {
		grade,
		percentage,
		isPassing: true,
		gradeColor: getGradeColor(grade),
	}
}

const getGradeColor = (grade: string) => {
	const colors: Record<string, string> = {
		'A+': 'bg-green-500',
		A: 'bg-green-400',
		'B+': 'bg-blue-500',
		B: 'bg-blue-400',
		C: 'bg-yellow-500',
		D: 'bg-orange-500',
		F: 'bg-red-500',
	}
	return colors[grade] || 'bg-gray-500'
}
