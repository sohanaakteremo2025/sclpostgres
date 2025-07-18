const bangladeshTime = new Date().toLocaleString('en-GB', {
	timeZone: 'Asia/Dhaka', // Ensures GMT+6 time
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false, // Ensures 24-hour format
})

export const studentAttendanceSMSTemplate = ({
	schoolName,
	studentName,
	classes,
	section,
	studentId,
	status,
}: {
	schoolName: string
	studentName: string
	classes: string
	section: string
	studentId: string
	status: 'Present' | 'Absent'
}) => `${schoolName}
Student: ${studentName}
Class: ${classes} - ${section}
Roll: ${studentId}
Status: ${status}
Date: ${bangladeshTime}`
