'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, FileCheck, FileX, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'

export type ResultPublicationRow = {
	id: string
	isPublished: boolean
	publishedAt: Date | null
	publishedBy: string | null
	examSchedule: {
		id: string
		date: Date
		exam: {
			title: string
			examType: {
				name: string
			}
			session: {
				title: string
			}
		}
		class: {
			name: string
		}
		section: {
			name: string
		} | null
		subject: {
			name: string
		}
		results: Array<{
			id: string
			obtainedMarks: number
			totalMarks: number
			percentage: number | null
			grade: string | null
			isAbsent: boolean
			student: {
				id: string
				name: string
				roll: string
			}
		}>
		components: Array<{
			id: string
			name: string
			maxMarks: number
			order: number
		}>
	}
}

export const resultPublicationColumns: ColumnDef<ResultPublicationRow>[] = [
	{
		accessorKey: 'examSchedule.exam.title',
		header: 'Exam',
		cell: ({ row }) => {
			const examSchedule = row.original.examSchedule
			return (
				<div className="space-y-1">
					<div className="font-medium">{examSchedule.exam.title}</div>
					<div className="text-sm text-muted-foreground">
						{examSchedule.exam.examType.name}
					</div>
				</div>
			)
		},
	},
	{
		accessorKey: 'examSchedule.subject.name',
		header: 'Subject',
		cell: ({ row }) => {
			return (
				<div className="font-medium">
					{row.original.examSchedule.subject.name}
				</div>
			)
		},
	},
	{
		accessorKey: 'examSchedule.class.name',
		header: 'Class & Section',
		cell: ({ row }) => {
			const examSchedule = row.original.examSchedule
			return (
				<div className="space-y-1">
					<div className="font-medium">{examSchedule.class.name}</div>
					{examSchedule.section && (
						<div className="text-sm text-muted-foreground">
							Section: {examSchedule.section.name}
						</div>
					)}
				</div>
			)
		},
	},
	{
		accessorKey: 'examSchedule.date',
		header: 'Exam Date',
		cell: ({ row }) => {
			return (
				<div className="text-sm">
					{format(new Date(row.original.examSchedule.date), 'dd MMM yyyy')}
				</div>
			)
		},
	},
	{
		accessorKey: 'examSchedule.results',
		header: 'Results',
		cell: ({ row }) => {
			const results = row.original.examSchedule.results
			const totalStudents = results.length
			const absentStudents = results.filter(r => r.isAbsent).length
			const presentStudents = totalStudents - absentStudents

			if (totalStudents === 0) {
				return (
					<Badge variant="secondary" className="text-xs">
						No Results
					</Badge>
				)
			}

			return (
				<div className="space-y-1">
					<div className="text-sm font-medium">
						{totalStudents} Students
					</div>
					<div className="text-xs text-muted-foreground">
						{presentStudents} Present • {absentStudents} Absent
					</div>
				</div>
			)
		},
	},
	{
		accessorKey: 'isPublished',
		header: 'Status',
		cell: ({ row }) => {
			const isPublished = row.original.isPublished
			const publishedAt = row.original.publishedAt

			if (isPublished && publishedAt) {
				return (
					<div className="space-y-1">
						<Badge variant="default" className="text-xs">
							<FileCheck className="w-3 h-3 mr-1" />
							Published
						</Badge>
						<div className="text-xs text-muted-foreground">
							{format(new Date(publishedAt), 'dd MMM yyyy, HH:mm')}
						</div>
					</div>
				)
			}

			return (
				<Badge variant="secondary" className="text-xs">
					<FileX className="w-3 h-3 mr-1" />
					Draft
				</Badge>
			)
		},
	},
	{
		accessorKey: 'examSchedule.exam.session.title',
		header: 'Session',
		cell: ({ row }) => {
			return (
				<Badge variant="outline" className="text-xs">
					{row.original.examSchedule.exam.session.title}
				</Badge>
			)
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const publication = row.original
			const hasResults = publication.examSchedule.results.length > 0

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => {
								// Navigate to view results
								window.location.href = `/admin/exam-schedules/${publication.examSchedule.id}/results`
							}}
						>
							<Eye className="mr-2 h-4 w-4" />
							View Results
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								// Navigate to statistics
								window.location.href = `/admin/exam-schedules/${publication.examSchedule.id}/statistics`
							}}
						>
							<BarChart3 className="mr-2 h-4 w-4" />
							Statistics
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{hasResults && (
							<>
								{!publication.isPublished ? (
									<DropdownMenuItem
										onClick={() => {
											// Handle publish
											window.dispatchEvent(
												new CustomEvent('publish-results', {
													detail: { examScheduleId: publication.examSchedule.id },
												}),
											)
										}}
										className="text-green-600"
									>
										<FileCheck className="mr-2 h-4 w-4" />
										Publish Results
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem
										onClick={() => {
											// Handle unpublish
											window.dispatchEvent(
												new CustomEvent('unpublish-results', {
													detail: { examScheduleId: publication.examSchedule.id },
												}),
											)
										}}
										className="text-red-600"
									>
										<FileX className="mr-2 h-4 w-4" />
										Unpublish Results
									</DropdownMenuItem>
								)}
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]