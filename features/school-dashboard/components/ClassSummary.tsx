'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
	Users,
	DollarSign,
	AlertTriangle,
	CheckCircle,
	Grid3X3,
	List,
} from 'lucide-react'
import type { ClassSummaryItem } from '../types'

interface PremiumClassSummaryProps {
	classes: ClassSummaryItem[]
	className?: string
}

export function PremiumClassSummary({
	classes,
	className,
}: PremiumClassSummaryProps) {
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-BD', {
			style: 'currency',
			currency: 'BDT',
			minimumFractionDigits: 0,
		}).format(amount)
	}

	const getCollectionRate = (collected: number, total: number) => {
		return total > 0 ? Math.round((collected / total) * 100) : 0
	}

	const getCollectionStatus = (rate: number) => {
		if (rate >= 90)
			return {
				color: 'bg-green-500',
				label: 'Excellent',
				variant: 'default' as const,
			}
		if (rate >= 75)
			return {
				color: 'bg-blue-500',
				label: 'Good',
				variant: 'secondary' as const,
			}
		if (rate >= 60)
			return {
				color: 'bg-yellow-500',
				label: 'Average',
				variant: 'outline' as const,
			}
		return {
			color: 'bg-red-500',
			label: 'Poor',
			variant: 'destructive' as const,
		}
	}

	const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0)
	const totalCollected = classes.reduce(
		(sum, cls) => sum + cls.collectedFees,
		0,
	)
	const totalFees = classes.reduce((sum, cls) => sum + cls.totalFees, 0)
	const overallCollectionRate = getCollectionRate(totalCollected, totalFees)

	const ClassCard = ({ classData }: { classData: ClassSummaryItem }) => {
		const collectionRate = getCollectionRate(
			classData.collectedFees,
			classData.totalFees,
		)
		const status = getCollectionStatus(collectionRate)

		return (
			<Card className="hover:shadow-md transition-all">
				<CardContent className="p-4">
					<div className="flex items-start justify-between mb-3">
						<div>
							<h3 className="font-semibold text-sm">{classData.className}</h3>
							<p className="text-xs text-muted-foreground">
								{classData.sectionCount} section
								{classData.sectionCount !== 1 ? 's' : ''}
							</p>
						</div>
						<Badge variant={status.variant} className="text-xs">
							{status.label}
						</Badge>
					</div>

					<div className="space-y-3">
						{/* Student Count */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Users className="w-3 h-3 text-muted-foreground" />
								<span className="text-xs text-muted-foreground">Students</span>
							</div>
							<span className="font-medium text-sm">
								{classData.studentCount}
							</span>
						</div>

						{/* Fee Collection Progress */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<DollarSign className="w-3 h-3 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">
										Collection
									</span>
								</div>
								<span className="text-xs font-medium">{collectionRate}%</span>
							</div>
							<Progress value={collectionRate} className="h-1.5" />
						</div>

						{/* Financial Summary */}
						<div className="pt-2 border-t space-y-1">
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">Collected:</span>
								<span className="font-medium text-green-600">
									{formatCurrency(classData.collectedFees)}
								</span>
							</div>
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">Pending:</span>
								<span className="font-medium text-orange-600">
									{formatCurrency(classData.pendingFees)}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	const ClassListItem = ({ classData }: { classData: ClassSummaryItem }) => {
		const collectionRate = getCollectionRate(
			classData.collectedFees,
			classData.totalFees,
		)
		const status = getCollectionStatus(collectionRate)

		return (
			<div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
				<div className="flex items-center space-x-4">
					<div>
						<h3 className="font-semibold text-sm">{classData.className}</h3>
						<p className="text-xs text-muted-foreground">
							{classData.studentCount} students • {classData.sectionCount}{' '}
							sections
						</p>
					</div>
				</div>

				<div className="flex items-center space-x-6">
					<div className="text-right">
						<p className="text-sm font-medium">
							{formatCurrency(classData.collectedFees)}
						</p>
						<p className="text-xs text-muted-foreground">
							of {formatCurrency(classData.totalFees)}
						</p>
					</div>

					<div className="flex items-center space-x-2">
						<div className="w-20">
							<Progress value={collectionRate} className="h-2" />
						</div>
						<Badge variant={status.variant} className="text-xs min-w-16">
							{collectionRate}%
						</Badge>
					</div>
				</div>
			</div>
		)
	}

	return (
		<Card className={`border-0 shadow-sm ${className || ''}`}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base font-semibold">
							Class-wise Performance
						</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Student distribution and fee collection status
						</p>
					</div>

					<div className="flex items-center space-x-2">
						<div className="flex rounded-lg border p-1">
							<Button
								variant={viewMode === 'grid' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('grid')}
								className="text-xs h-7 px-2"
							>
								<Grid3X3 className="w-3 h-3" />
							</Button>
							<Button
								variant={viewMode === 'list' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => setViewMode('list')}
								className="text-xs h-7 px-2"
							>
								<List className="w-3 h-3" />
							</Button>
						</div>
					</div>
				</div>

				{/* Summary Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
					<div className="text-center p-3 bg-muted/50 rounded-lg shadow-sm border">
						<p className="text-xs text-muted-foreground">Total Students</p>
						<p className="text-lg font-bold">{totalStudents}</p>
					</div>
					<div className="text-center p-3 bg-green-50 rounded-lg shadow-sm border">
						<p className="text-xs text-muted-foreground">Collected</p>
						<p className="text-lg font-bold text-green-600">
							{formatCurrency(totalCollected)}
						</p>
					</div>
					<div className="text-center p-3 bg-orange-50 rounded-lg shadow-sm border">
						<p className="text-xs text-muted-foreground">Pending</p>
						<p className="text-lg font-bold text-orange-600">
							{formatCurrency(totalFees - totalCollected)}
						</p>
					</div>
					<div className="text-center p-3 bg-blue-50 rounded-lg shadow-sm border">
						<p className="text-xs text-muted-foreground">Collection Rate</p>
						<p className="text-lg font-bold text-blue-600">
							{overallCollectionRate}%
						</p>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{viewMode === 'grid' ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{classes.map(classData => (
							<ClassCard key={classData.className} classData={classData} />
						))}
					</div>
				) : (
					<div className="space-y-3">
						{classes.map(classData => (
							<ClassListItem key={classData.className} classData={classData} />
						))}
					</div>
				)}

				{classes.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						<Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>No class data available</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
