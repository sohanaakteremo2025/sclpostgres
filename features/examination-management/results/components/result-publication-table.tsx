'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/table/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileCheck, FileX, Search, Filter } from 'lucide-react'
import { resultPublicationColumns, type ResultPublicationRow } from './columns'
import {
	publishExamResults,
	unpublishExamResults,
	getResultPublications,
} from '../api/resultPublication.action'

interface ResultPublicationTableProps {
	initialData: ResultPublicationRow[]
	classes: Array<{ id: string; name: string }>
	sessions: Array<{ id: string; title: string }>
}

export function ResultPublicationTable({
	initialData,
	classes,
	sessions,
}: ResultPublicationTableProps) {
	const [data, setData] = useState<ResultPublicationRow[]>(initialData)
	const [filteredData, setFilteredData] = useState<ResultPublicationRow[]>(initialData)
	const [loading, setLoading] = useState(false)
	const [publishDialog, setPublishDialog] = useState<{
		open: boolean
		examScheduleId: string
		examTitle: string
	}>({ open: false, examScheduleId: '', examTitle: '' })
	const [unpublishDialog, setUnpublishDialog] = useState<{
		open: boolean
		examScheduleId: string
		examTitle: string
	}>({ open: false, examScheduleId: '', examTitle: '' })

	// Filters
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedClass, setSelectedClass] = useState<string>('all')
	const [selectedSession, setSelectedSession] = useState<string>('all')
	const [statusFilter, setStatusFilter] = useState<string>('all')

	// Apply filters
	useEffect(() => {
		let filtered = data

		if (searchTerm) {
			filtered = filtered.filter(
				item =>
					item.examSchedule.exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.examSchedule.subject.name.toLowerCase().includes(searchTerm.toLowerCase()),
			)
		}

		if (selectedClass && selectedClass !== 'all') {
			filtered = filtered.filter(item => item.examSchedule.class.name === selectedClass)
		}

		if (selectedSession && selectedSession !== 'all') {
			filtered = filtered.filter(
				item => item.examSchedule.exam.session.title === selectedSession,
			)
		}

		if (statusFilter && statusFilter !== 'all') {
			if (statusFilter === 'published') {
				filtered = filtered.filter(item => item.isPublished)
			} else if (statusFilter === 'draft') {
				filtered = filtered.filter(item => !item.isPublished)
			}
		}

		setFilteredData(filtered)
	}, [data, searchTerm, selectedClass, selectedSession, statusFilter])

	// Event listeners for custom events from column actions
	useEffect(() => {
		const handlePublish = (event: any) => {
			const { examScheduleId } = event.detail
			const publication = data.find(p => p.examSchedule.id === examScheduleId)
			if (publication) {
				setPublishDialog({
					open: true,
					examScheduleId,
					examTitle: publication.examSchedule.exam.title,
				})
			}
		}

		const handleUnpublish = (event: any) => {
			const { examScheduleId } = event.detail
			const publication = data.find(p => p.examSchedule.id === examScheduleId)
			if (publication) {
				setUnpublishDialog({
					open: true,
					examScheduleId,
					examTitle: publication.examSchedule.exam.title,
				})
			}
		}

		window.addEventListener('publish-results', handlePublish)
		window.addEventListener('unpublish-results', handleUnpublish)

		return () => {
			window.removeEventListener('publish-results', handlePublish)
			window.removeEventListener('unpublish-results', handleUnpublish)
		}
	}, [data])

	const refreshData = async () => {
		setLoading(true)
		try {
			const result = await getResultPublications({
				classId: selectedClass || undefined,
				sessionId: selectedSession || undefined,
				isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
			})

			if (result.success) {
				setData(result.data)
			} else {
				toast({
					title: 'Error',
					description: result.error,
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to refresh data',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	const handlePublish = async () => {
		setLoading(true)
		try {
			const result = await publishExamResults(publishDialog.examScheduleId, true, true)

			if (result.success) {
				toast({
					title: 'Success',
					description: 'Results published successfully',
				})
				await refreshData()
			} else {
				toast({
					title: 'Error',
					description: result.error,
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to publish results',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
			setPublishDialog({ open: false, examScheduleId: '', examTitle: '' })
		}
	}

	const handleUnpublish = async () => {
		setLoading(true)
		try {
			const result = await unpublishExamResults(unpublishDialog.examScheduleId)

			if (result.success) {
				toast({
					title: 'Success',
					description: 'Results unpublished successfully',
				})
				await refreshData()
			} else {
				toast({
					title: 'Error',
					description: result.error,
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to unpublish results',
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
			setUnpublishDialog({ open: false, examScheduleId: '', examTitle: '' })
		}
	}

	const clearFilters = () => {
		setSearchTerm('')
		setSelectedClass('')
		setSelectedSession('')
		setStatusFilter('')
	}

	// Summary stats
	const totalExams = data.length
	const publishedCount = data.filter(item => item.isPublished).length
	const draftCount = totalExams - publishedCount

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Exams</CardTitle>
						<FileCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalExams}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Published</CardTitle>
						<Badge variant="default" className="text-xs">
							{publishedCount}
						</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{publishedCount}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Draft</CardTitle>
						<Badge variant="secondary" className="text-xs">
							{draftCount}
						</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">{draftCount}</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<div className="space-y-2">
							<Label htmlFor="search">Search</Label>
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Search exams..."
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Class</Label>
							<Select value={selectedClass} onValueChange={setSelectedClass}>
								<SelectTrigger>
									<SelectValue placeholder="All Classes" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Classes</SelectItem>
									{classes.map(cls => (
										<SelectItem key={cls.id} value={cls.name}>
											{cls.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Session</Label>
							<Select value={selectedSession} onValueChange={setSelectedSession}>
								<SelectTrigger>
									<SelectValue placeholder="All Sessions" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Sessions</SelectItem>
									{sessions.map(session => (
										<SelectItem key={session.id} value={session.title}>
											{session.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Status</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="published">Published</SelectItem>
									<SelectItem value="draft">Draft</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>&nbsp;</Label>
							<Button variant="outline" onClick={clearFilters} className="w-full">
								Clear Filters
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Data Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Result Publications</CardTitle>
						<Button variant="outline" onClick={refreshData} disabled={loading}>
							{loading ? 'Refreshing...' : 'Refresh'}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<DataTable columns={resultPublicationColumns} data={filteredData} />
				</CardContent>
			</Card>

			{/* Publish Dialog */}
			<AlertDialog open={publishDialog.open} onOpenChange={(open) => setPublishDialog(prev => ({ ...prev, open }))}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Publish Results</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to publish results for "{publishDialog.examTitle}"?
							This will make the results visible to students and parents.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handlePublish} disabled={loading}>
							{loading ? 'Publishing...' : 'Publish Results'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Unpublish Dialog */}
			<AlertDialog open={unpublishDialog.open} onOpenChange={(open) => setUnpublishDialog(prev => ({ ...prev, open }))}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unpublish Results</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to unpublish results for "{unpublishDialog.examTitle}"?
							This will hide the results from students and parents.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleUnpublish}
							disabled={loading}
							className="bg-red-600 hover:bg-red-700"
						>
							{loading ? 'Unpublishing...' : 'Unpublish Results'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}