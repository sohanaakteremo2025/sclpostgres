'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	MoreHorizontal,
	Eye,
	Download,
	Send,
	Users,
	Search,
	Filter,
	FileText,
	GraduationCap,
} from 'lucide-react'
import { getStudentsForMarksheet } from '../api/student-marksheet.action'
import { useClasses, useSessions } from '@/hooks/queries/all-quries'
import { StudentMarksheetDialog } from './student-marksheet-dialog'

interface Student {
	id: string
	name: string
	roll: string
	photo?: string
	studentId: string
	class: {
		id: string
		name: string
	} | null
	section: {
		id: string
		name: string
	} | null
	session: {
		id: string
		title: string
	} | null
}

interface StudentMarksheetListProps {
	defaultFilters?: {
		classId?: string
		sectionId?: string
		sessionId?: string
	}
}

export function StudentMarksheetList({ defaultFilters = {} }: StudentMarksheetListProps) {
	const [filters, setFilters] = useState({
		search: '',
		classId: defaultFilters.classId || '',
		sectionId: defaultFilters.sectionId || '',
		sessionId: defaultFilters.sessionId || '',
	})

	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
	const [marksheetDialogOpen, setMarksheetDialogOpen] = useState(false)

	// Query hooks for filter options
	const { data: classes = [] } = useClasses()
	const { data: sessions = [] } = useSessions()

	// Get sections for selected class
	const selectedClass = classes.find(c => c.value === filters.classId)
	const sections = selectedClass?.sections || []

	// Main students query
	const {
		data: studentsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['students-marksheet', filters],
		queryFn: async () => {
			const response = await getStudentsForMarksheet({
				search: filters.search || undefined,
				classId: filters.classId || undefined,
				sectionId: filters.sectionId || undefined,
				sessionId: filters.sessionId || undefined,
			})

			if (!response.success) {
				throw new Error(response.error || 'Failed to fetch students')
			}

			return response.data
		},
		enabled: true,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})

	const students = studentsData || []

	const handleFilterChange = (key: string, value: string) => {
		setFilters(prev => ({
			...prev,
			[key]: value === 'all' ? '' : value,
			// Clear section if class changes
			...(key === 'classId' && { sectionId: '' }),
		}))
	}

	const clearFilters = () => {
		setFilters({
			search: '',
			classId: '',
			sectionId: '',
			sessionId: '',
		})
	}

	const handleViewMarksheet = (student: Student) => {
		setSelectedStudent(student)
		setMarksheetDialogOpen(true)
	}

	const handleDownloadMarksheet = async (student: Student) => {
		// Open the dialog and trigger download
		setSelectedStudent(student)
		setMarksheetDialogOpen(true)
		// The dialog will handle the PDF generation
	}

	const handleSendMarksheet = async (student: Student) => {
		// TODO: Implement sending marksheet via email/SMS
		console.log('Send marksheet for:', student.name)
	}

	return (
		<div className="space-y-6">
			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Search Students for Marksheet
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by student name, roll number, or student ID..."
							value={filters.search}
							onChange={e => handleFilterChange('search', e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Filter Row */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<Select
							value={filters.sessionId || 'all'}
							onValueChange={value => handleFilterChange('sessionId', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Session" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sessions</SelectItem>
								{sessions.map(session => (
									<SelectItem key={session.value} value={session.value}>
										{session.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.classId || 'all'}
							onValueChange={value => handleFilterChange('classId', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Class" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Classes</SelectItem>
								{classes.map(cls => (
									<SelectItem key={cls.value} value={cls.value}>
										{cls.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.sectionId || 'all'}
							onValueChange={value => handleFilterChange('sectionId', value)}
							disabled={!filters.classId}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Section" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sections</SelectItem>
								{sections.map((section: any) => (
									<SelectItem key={section.value} value={section.value}>
										{section.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button variant="outline" onClick={clearFilters}>
							Clear Filters
						</Button>
					</div>

					{/* Active Filters */}
					{(filters.search || filters.classId || filters.sectionId || filters.sessionId) && (
						<div className="flex flex-wrap gap-2">
							<span className="text-sm text-muted-foreground">Active filters:</span>
							{filters.search && (
								<Badge
									variant="secondary"
									className="cursor-pointer"
									onClick={() => handleFilterChange('search', '')}
								>
									Search: {filters.search} ×
								</Badge>
							)}
							{filters.classId && (
								<Badge
									variant="secondary"
									className="cursor-pointer"
									onClick={() => handleFilterChange('classId', '')}
								>
									Class: {classes.find(c => c.value === filters.classId)?.label} ×
								</Badge>
							)}
							{filters.sectionId && (
								<Badge
									variant="secondary"
									className="cursor-pointer"
									onClick={() => handleFilterChange('sectionId', '')}
								>
									Section: {sections.find((s: any) => s.value === filters.sectionId)?.label} ×
								</Badge>
							)}
							{filters.sessionId && (
								<Badge
									variant="secondary"
									className="cursor-pointer"
									onClick={() => handleFilterChange('sessionId', '')}
								>
									Session: {sessions.find(s => s.value === filters.sessionId)?.label} ×
								</Badge>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Students List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Students
						{students.length > 0 && (
							<Badge variant="outline" className="ml-2">
								{students.length} students
							</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
							))}
						</div>
					) : error ? (
						<div className="text-center py-12">
							<FileText className="h-12 w-12 mx-auto text-red-500 mb-4" />
							<h3 className="text-lg font-semibold mb-2">Error Loading Students</h3>
							<p className="text-muted-foreground mb-4">
								There was an error loading the students list. Please try again.
							</p>
							<Button onClick={() => refetch()}>Retry</Button>
						</div>
					) : students.length === 0 ? (
						<div className="text-center py-12">
							<GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No Students Found</h3>
							<p className="text-muted-foreground">
								No students match your current filters. Try adjusting your search criteria.
							</p>
						</div>
					) : (
						<div className="border rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Student</TableHead>
										<TableHead>Class & Section</TableHead>
										<TableHead>Session</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{students.map((student) => (
										<TableRow key={student.id} className="hover:bg-muted/50">
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="h-10 w-10">
														<AvatarImage src={student.photo} />
														<AvatarFallback>
															{student.name.split(' ').map(n => n[0]).join('')}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{student.name}</p>
														<p className="text-sm text-muted-foreground">
															Roll: {student.roll}
														</p>
														<p className="text-xs text-muted-foreground">
															ID: {student.studentId}
														</p>
													</div>
												</div>
											</TableCell>
											
											<TableCell>
												<div>
													<p className="font-medium">{student.class?.name || 'No Class'}</p>
													{student.section && (
														<p className="text-sm text-muted-foreground">
															Section {student.section.name}
														</p>
													)}
												</div>
											</TableCell>

											<TableCell>
												<p className="text-sm">
													{student.session?.title || 'No Session'}
												</p>
											</TableCell>

											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Marksheet Actions</DropdownMenuLabel>
														<DropdownMenuItem 
															onClick={() => handleViewMarksheet(student)}
														>
															<Eye className="mr-2 h-4 w-4" />
															View Marksheet
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleDownloadMarksheet(student)}
														>
															<Download className="mr-2 h-4 w-4" />
															Download PDF
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleSendMarksheet(student)}
														>
															<Send className="mr-2 h-4 w-4" />
															Send to Parent
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Student Marksheet Dialog */}
			{selectedStudent && (
				<StudentMarksheetDialog
					student={selectedStudent}
					sessionId={filters.sessionId || undefined}
					open={marksheetDialogOpen}
					onOpenChange={(open) => {
						setMarksheetDialogOpen(open)
						if (!open) {
							setSelectedStudent(null)
						}
					}}
				/>
			)}
		</div>
	)
}