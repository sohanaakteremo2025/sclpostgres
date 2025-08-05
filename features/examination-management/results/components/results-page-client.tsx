'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	useClasses,
	useExamTypes,
	useSessions,
} from '@/hooks/queries/all-quries'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Eye, Filter, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getFilteredResults } from '../api/results-display.action'
import { ResultsGrid } from './results-grid'
import { ResultsStatistics } from './results-statistics'
import { ResultsTable } from './results-table'

interface ResultsPageClientProps {
	searchParams: { [key: string]: string | string[] | undefined }
}

export function ResultsPageClient({ searchParams }: ResultsPageClientProps) {
	const [filters, setFilters] = useState({
		search: '',
		classId: '',
		sessionId: '',
		examTypeId: '',
		publishedOnly: true,
		view: 'table',
	})

	// Initialize filters from searchParams after component mounts to prevent hydration mismatch
	useEffect(() => {
		setFilters({
			search: (searchParams.search as string) || '',
			classId: (searchParams.classId as string) || '',
			sessionId: (searchParams.sessionId as string) || '',
			examTypeId: (searchParams.examTypeId as string) || '',
			publishedOnly: (searchParams.publishedOnly as string) !== 'false',
			view: (searchParams.view as string) || 'table',
		})
	}, [searchParams])

	// Query hooks for filter options
	const { data: classes = [] } = useClasses()
	const { data: sessions = [] } = useSessions()
	const { data: examTypes = [] } = useExamTypes()

	// Main results query
	const {
		data: resultsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['exam-results', filters],
		queryFn: async () => {
			try {
				const response = await getFilteredResults({
					search: filters.search || undefined,
					classId: filters.classId || undefined,
					sessionId: filters.sessionId || undefined,
					examTypeId: filters.examTypeId || undefined,
					publishedOnly: filters.publishedOnly,
					page: 1,
					limit: 50,
				})

				if (!response.success) {
					throw new Error(response.error || 'Failed to fetch results')
				}

				return response.data
			} catch (error: any) {
				console.error('Error fetching results:', error)
				throw new Error(error.message || 'Failed to fetch results')
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
		retryDelay: 1000,
	})

	const results = resultsData?.results || []

	const handleFilterChange = (key: string, value: string | boolean) => {
		setFilters(prev => ({ ...prev, [key]: value }))

		// Update URL params safely
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search)
			if (value) {
				params.set(key, String(value))
			} else {
				params.delete(key)
			}
			window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
		}
	}

	const clearFilters = () => {
		setFilters({
			search: '',
			classId: '',
			sessionId: '',
			examTypeId: '',
			publishedOnly: true,
			view: 'table',
		})
		if (typeof window !== 'undefined') {
			window.history.replaceState({}, '', window.location.pathname)
		}
	}

	return (
		<div className="space-y-6">
			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Search & Filters
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by student name, roll number, or exam title..."
							value={filters.search}
							onChange={e => handleFilterChange('search', e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Filter Row */}
					<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
						<Select
							value={filters.sessionId}
							onValueChange={value => handleFilterChange('sessionId', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Session" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All Sessions</SelectItem>
								{sessions.map(session => (
									<SelectItem key={session.value} value={session.value}>
										{session.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.classId}
							onValueChange={value => handleFilterChange('classId', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Class" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All Classes</SelectItem>
								{classes.map(cls => (
									<SelectItem key={cls.value} value={cls.value}>
										{cls.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.examTypeId}
							onValueChange={value => handleFilterChange('examTypeId', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Exam Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All Types</SelectItem>
								{examTypes.map(type => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.publishedOnly ? 'true' : 'false'}
							onValueChange={value =>
								handleFilterChange('publishedOnly', value === 'true')
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="true">Published Only</SelectItem>
								<SelectItem value="false">All Results</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline" onClick={clearFilters}>
							Clear Filters
						</Button>
					</div>

					{/* Active Filters */}
					{(filters.search ||
						filters.classId ||
						filters.sessionId ||
						filters.examTypeId ||
						!filters.publishedOnly) && (
						<div className="flex flex-wrap gap-2">
							<span className="text-sm text-muted-foreground">
								Active filters:
							</span>
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
									Class: {classes.find(c => c.value === filters.classId)?.label}{' '}
									×
								</Badge>
							)}
							{filters.sessionId && (
								<Badge
									variant="secondary"
									className="cursor-pointer"
									onClick={() => handleFilterChange('sessionId', '')}
								>
									Session:{' '}
									{sessions.find(s => s.value === filters.sessionId)?.label} ×
								</Badge>
							)}
							{filters.examTypeId && (
								<Badge
									variant="secondary"
									className="cursor-pointer"
									onClick={() => handleFilterChange('examTypeId', '')}
								>
									Type:{' '}
									{examTypes.find(t => t.value === filters.examTypeId)?.label} ×
								</Badge>
							)}
							{!filters.publishedOnly && (
								<Badge
									variant="secondary"
									className="cursor-pointer"
									onClick={() => handleFilterChange('publishedOnly', true)}
								>
									Including Unpublished ×
								</Badge>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Statistics Overview */}
			<ResultsStatistics filters={filters} />

			{/* Results Display */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Eye className="h-5 w-5" />
							Exam Results
							{results.length > 0 && (
								<Badge variant="outline" className="ml-2">
									{results.length} results
								</Badge>
							)}
						</CardTitle>

						<Tabs
							value={filters.view}
							onValueChange={value => handleFilterChange('view', value)}
						>
							<TabsList>
								<TabsTrigger value="table">Table</TabsTrigger>
								<TabsTrigger value="grid">Grid</TabsTrigger>
								<TabsTrigger value="analytics">Analytics</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs value={filters.view} className="w-full">
						<TabsContent value="table" className="mt-0">
							<ResultsTable
								results={results}
								loading={isLoading}
								error={error}
							/>
						</TabsContent>
						<TabsContent value="grid" className="mt-0">
							<ResultsGrid
								results={results}
								loading={isLoading}
								error={error}
							/>
						</TabsContent>
						<TabsContent value="analytics" className="mt-0">
							<div className="text-center py-12">
								<BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">Analytics View</h3>
								<p className="text-muted-foreground mb-4">
									Detailed analytics and charts will be displayed here
								</p>
								<Button>View Full Analytics</Button>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
