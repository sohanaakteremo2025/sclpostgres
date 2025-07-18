import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

interface Teacher {
	fullName: string
}

interface SectionDaysTeacher {
	section: string
	days: string[]
	scheduleStart: string
	scheduleEnd: string
	teacher: Teacher
}

interface Subject {
	name: string
	class: {
		name: string
	}
	sectionDaysTeachers: SectionDaysTeacher[]
}

interface ClassScheduleProps {
	subjects: Subject[]
}

const daysOfWeek = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
]

export const ClassSchedule: React.FC<ClassScheduleProps> = ({ subjects }) => {
	const schedule: { [key: string]: { [key: string]: Subject[] } } = {}
	const timeSlots: string[] = []

	// Populate schedule and timeSlots
	subjects.forEach(subject => {
		subject.sectionDaysTeachers.forEach(sdt => {
			const timeSlot = `${sdt.scheduleStart}-${sdt.scheduleEnd}`
			if (!timeSlots.includes(timeSlot)) {
				timeSlots.push(timeSlot)
			}
			sdt.days.forEach(day => {
				if (!schedule[day]) {
					schedule[day] = {}
				}
				if (!schedule[day][timeSlot]) {
					schedule[day][timeSlot] = []
				}
				schedule[day][timeSlot].push(subject)
			})
		})
	})

	// Sort timeSlots
	timeSlots.sort((a, b) => {
		const [aStart] = a.split('-')
		const [bStart] = b.split('-')
		return aStart.localeCompare(bStart)
	})

	return (
		<Card className="w-full max-w-6xl mx-auto">
			<CardHeader>
				<CardTitle>
					Class Schedule - {subjects[0]?.class.name || 'N/A'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-32">Time</TableHead>
								{daysOfWeek.map(day => (
									<TableHead key={day}>{day}</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{timeSlots.map(timeSlot => (
								<TableRow key={timeSlot}>
									<TableCell className="font-medium">{timeSlot}</TableCell>
									{daysOfWeek.map(day => (
										<TableCell key={`${day}-${timeSlot}`} className="p-0">
											{schedule[day]?.[timeSlot]?.map((subject, index) => (
												<div
													key={`${subject.name}-${index}`}
													className="bg-primary/10 p-2 h-full border-b last:border-b-0"
												>
													<p className="font-semibold">{subject.name}</p>
													<p className="text-xs text-muted-foreground">
														{subject.sectionDaysTeachers[0].teacher.fullName}
													</p>
													<p className="text-xs text-muted-foreground">
														Section {subject.sectionDaysTeachers[0].section}
													</p>
												</div>
											))}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	)
}
