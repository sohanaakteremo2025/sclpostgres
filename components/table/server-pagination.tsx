'use client'

import { useState } from 'react'
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
} from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface ServerPaginationProps {
	currentPage: number
	pageCount: number
	onPageChange: (page: number) => void
	pageSize?: number
	onPageSizeChange?: (pageSize: number) => void
}

export function ServerPagination({
	currentPage,
	pageCount,
	onPageChange,
	pageSize = 10,
	onPageSizeChange,
}: ServerPaginationProps) {
	// Track local page size state for display
	const [localPageSize, setLocalPageSize] = useState(pageSize)

	// Handle page size change
	const handlePageSizeChange = (value: string) => {
		const newSize = Number(value)
		setLocalPageSize(newSize)

		if (onPageSizeChange) {
			onPageSizeChange(newSize)
		}
	}

	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex items-center space-x-6 lg:space-x-8 justify-between w-full">
				{onPageSizeChange && (
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">Rows per page</p>
						<Select
							value={`${localPageSize}`}
							onValueChange={handlePageSizeChange}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue placeholder={localPageSize} />
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 20, 30, 40, 50, 100, 500].map(size => (
									<SelectItem key={size} value={`${size}`}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="flex items-center space-x-2">
					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {currentPage} of {pageCount}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => onPageChange(1)}
							disabled={currentPage <= 1}
						>
							<span className="sr-only">Go to first page</span>
							<DoubleArrowLeftIcon className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage <= 1}
						>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeftIcon className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage >= pageCount}
						>
							<span className="sr-only">Go to next page</span>
							<ChevronRightIcon className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => onPageChange(pageCount)}
							disabled={currentPage >= pageCount}
						>
							<span className="sr-only">Go to last page</span>
							<DoubleArrowRightIcon className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
