import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			{/* Financial Overview Skeleton */}
			<div className="space-y-4">
				<div className="flex items-center space-x-2">
					<Skeleton className="h-5 w-5" />
					<Skeleton className="h-6 w-48" />
				</div>

				{/* Primary Stats Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={`primary-${i}`} className="border-0 shadow-sm">
							<CardHeader className="space-y-0 pb-2">
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-4" />
								</div>
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-32 mb-2" />
								<Skeleton className="h-3 w-20" />
							</CardContent>
						</Card>
					))}
				</div>

				{/* Secondary Stats Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={`secondary-${i}`} className="border-0 shadow-sm">
							<CardHeader className="space-y-0 pb-2">
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-4" />
								</div>
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-32 mb-2" />
								<Skeleton className="h-3 w-20" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Chart Skeleton */}
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<Skeleton className="h-5 w-48" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-80 w-full" />
				</CardContent>
			</Card>

			{/* Academic Overview Skeleton */}
			<div className="space-y-4">
				<div className="flex items-center space-x-2">
					<Skeleton className="h-5 w-5" />
					<Skeleton className="h-6 w-40" />
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					{Array.from({ length: 2 }).map((_, i) => (
						<Card key={`academic-${i}`} className="border-0 shadow-sm">
							<CardHeader className="space-y-0 pb-2">
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-4" />
								</div>
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-32 mb-2" />
								<Skeleton className="h-3 w-20" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Class Summary Skeleton */}
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<Skeleton className="h-5 w-56" />
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
						{Array.from({ length: 10 }).map((_, i) => (
							<div
								key={`class-${i}`}
								className="flex items-center justify-between p-3 rounded-lg border"
							>
								<div className="space-y-2">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-3 w-20" />
								</div>
								<Skeleton className="h-6 w-8 rounded-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
