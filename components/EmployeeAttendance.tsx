'use client'

import React, { useEffect, useState } from 'react'
import { Check, X, ArrowLeft, ArrowRight } from 'lucide-react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	format,
	addMonths,
	subMonths,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	startOfWeek,
	endOfWeek,
} from 'date-fns'
import { EmployeeAttendance } from '@prisma/client'
import {
	getAttendancesForEmployee,
} from '@/lib/actions/attendance.action'
import { WEEKEND_DAYS } from '@/constants/constants'

const AttendanceStats = ({
	attendances,
}: {
	attendances: EmployeeAttendance[]
}) => {
	const present = attendances.filter(a => a?.isPresent).length
	const absent = attendances.filter(a => a?.isPresent === false).length
	const total = attendances.length

	return (
		<div className="grid grid-cols-3 gap-4 mb-6">
			<Card className="p-4">
				<div className="text-sm text-muted-foreground">Present</div>
				<div className="text-2xl font-bold text-green-600">{present}</div>
			</Card>
			<Card className="p-4">
				<div className="text-sm text-muted-foreground">Absent</div>
				<div className="text-2xl font-bold text-red-600">{absent}</div>
			</Card>
			<Card className="p-4">
				<div className="text-sm text-muted-foreground">Attendance Rate</div>
				<div className="text-2xl font-bold">
					{total ? Math.round((present / total) * 100) : 0}%
				</div>
			</Card>
		</div>
	)
}

const CalendarDay = ({ date, isCurrentMonth, attendance, isWeekend }: any) => {
	const dayNumber = format(date, 'd')
	const dayName = format(date, 'EEE')

	let statusBadge
	if (isWeekend) {
		statusBadge = (
			<Badge variant="secondary" className="w-full">
				Weekend
			</Badge>
		)
	} else if (attendance) {
		statusBadge = attendance.isPresent ? (
			<Badge variant="success" className="w-full text-sm">
				<Check className="w-5 h-5 mr-1" /> Present
			</Badge>
		) : (
			<Badge variant="destructive" className=" w-full text-sm">
				<X className="w-5 h-5 mr-1" /> Absent
			</Badge>
		)
	} else {
		statusBadge = (
			<Badge variant="outline" className="w-full">
				No Record
			</Badge>
		)
	}

	let bgColor = 'bg-gray-100'
	if (attendance) {
		bgColor = attendance.isPresent ? 'bg-green-100' : 'bg-red-100'
	} else if (isWeekend) {
		bgColor = 'bg-gray-200'
	}

	return (
		<Card
			className={`h-full ${bgColor} ${!isCurrentMonth ? 'bg-gray-50/50' : ''}`}
		>
			<CardHeader className="p-2">
				<CardTitle
					className={`text-sm ${!isCurrentMonth ? 'text-gray-400' : ''}`}
				>
					{dayNumber}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-2 pt-0">
				<div className="text-xs text-muted-foreground mb-2">{dayName}</div>
			</CardContent>
			<CardFooter className="p-2">{statusBadge}</CardFooter>
		</Card>
	)
}

export default function EmployeeAttendances({
	employeeId,
}: {
	employeeId: string
}) {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [attendances, setAttendances] = useState<EmployeeAttendance[]>([])

	useEffect(() => {
		async function fetchAttendances() {
			const monthStart = startOfMonth(currentDate)
			const monthEnd = endOfMonth(currentDate)

			const data = await getAttendancesForEmployee(
				employeeId,
				format(monthStart, 'yyyy-MM-dd'),
				format(monthEnd, 'yyyy-MM-dd'),
			)
			setAttendances(data)
		}
		fetchAttendances()
	}, [employeeId, currentDate])

	const attendanceMap = new Map(
		attendances.map(attendance => [attendance.date, attendance]),
	)

	const monthStart = startOfMonth(currentDate)
	const monthEnd = endOfMonth(currentDate)
	const calendarStart = startOfWeek(monthStart)
	const calendarEnd = endOfWeek(monthEnd)

	const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
	const weeks = []
	let currentWeek: Date[] = []

	days.forEach(day => {
		if (currentWeek.length === 7) {
			weeks.push(currentWeek)
			currentWeek = []
		}
		currentWeek.push(day)
	})
	if (currentWeek.length > 0) {
		weeks.push(currentWeek)
	}

	const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
	const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

	return (
		<Card className="w-full mx-auto">
			<CardHeader>
				<div className="">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={prevMonth}>
							<ArrowLeft className="w-4 h-4" />
						</Button>
						<span className="font-medium min-w-[120px] text-center">
							{format(currentDate, 'MMMM yyyy')}
						</span>
						<Button variant="outline" size="sm" onClick={nextMonth}>
							<ArrowRight className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<AttendanceStats attendances={Array.from(attendanceMap.values())} />

				<div className="rounded-lg border p-4">
					<div className="grid grid-cols-7 gap-4">
						{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
							<div
								key={day}
								className="text-center font-semibold text-sm text-muted-foreground bg-gray-100 rounded-md p-2"
							>
								{day}
							</div>
						))}
						{weeks.map((week, weekIndex) => (
							<React.Fragment key={weekIndex}>
								{week.map(day => {
									const dateStr = format(day, 'yyyy-MM-dd')
									const isCurrentMonth =
										day.getMonth() === currentDate.getMonth()
									const dayOfWeek = format(day, 'EEEE')
									const isWeekend = WEEKEND_DAYS.includes(dayOfWeek)
									return (
										<CalendarDay
											key={dateStr}
											date={day}
											isCurrentMonth={isCurrentMonth}
											attendance={attendanceMap.get(dateStr)}
											isWeekend={isWeekend}
										/>
									)
								})}
							</React.Fragment>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
