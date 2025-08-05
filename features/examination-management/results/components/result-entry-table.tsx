'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { resultEntryColumns } from './result-entry-columns'
import { Button } from '@/components/ui/button'
import { PlusCircle, FileText, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ResultEntryManageDialog from './result-entry-manage-dialog'
import ResultStatisticsDialog from './result-statistics-dialog'
import PublishResultsDialog from './publish-results-dialog'
import { ExamSchedule } from '@/lib/zod'

interface ResultEntryTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function ResultEntryTable({
	dataPromise,
}: ResultEntryTableProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Result Entry Management
						</CardTitle>
						<CardDescription>
							Enter and manage exam results for students
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-xs">
							Click on any exam to enter results
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<PrismaDataTable
					dataPromise={dataPromise}
					columns={resultEntryColumns}
					enableAdvancedFilter={true}
					filterFlag="advancedFilters"
					pinnedColumns={{ right: ['actions'] }}
				>
					{/* Result Entry Management Dialog */}
					<PrismaDataTable.CustomDialog 
						variant="enter-results" 
						title="Enter Results"
						className="w-full max-w-7xl"
					>
						{({ item, onSuccess }) => (
							<ResultEntryManageDialog 
								examSchedule={item as any} 
								onSuccess={onSuccess} 
							/>
						)}
					</PrismaDataTable.CustomDialog>

					{/* Result Statistics Dialog */}
					<PrismaDataTable.CustomDialog 
						variant="view-statistics" 
						title="Result Statistics"
						className="w-full max-w-4xl"
					>
						{({ item }) => (
							<ResultStatisticsDialog examSchedule={item as any} />
						)}
					</PrismaDataTable.CustomDialog>

					{/* Publish Results Dialog */}
					<PrismaDataTable.CustomDialog 
						variant="publish-results" 
						title="Publish Results"
					>
						{({ item, onSuccess }) => <PublishResultsDialog examSchedule={item} onSuccess={onSuccess} />}
					</PrismaDataTable.CustomDialog>
				</PrismaDataTable>
			</CardContent>
		</Card>
	)
}