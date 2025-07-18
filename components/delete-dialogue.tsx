'use client'

import * as React from 'react'
import { AlertTriangle, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

interface DeleteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onDelete: () => Promise<void>
	onCancel?: () => void
	title?: string
	description?: string
	deleteButtonText?: string
	cancelButtonText?: string
	itemToDelete?: string
	children?: React.ReactNode
	dangerLevel?: 'low' | 'medium' | 'high'
}

export default function DeleteDialog({
	open,
	onOpenChange,
	onDelete,
	onCancel,
	title = 'Confirm Deletion',
	description = 'Are you sure you want to delete this item? This action cannot be undone.',
	deleteButtonText = 'Delete',
	cancelButtonText = 'Cancel',
	itemToDelete,
	children,
	dangerLevel = 'medium',
}: DeleteDialogProps) {
	const [isDeleting, setIsDeleting] = React.useState(false)

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await onDelete()
			onOpenChange(false)
		} catch (error) {
			console.error('Error during deletion:', error)
		} finally {
			setIsDeleting(false)
		}
	}

	const handleCancel = () => {
		if (onCancel) {
			onCancel()
		}
		onOpenChange(false)
	}

	const getDangerColor = () => {
		switch (dangerLevel) {
			case 'low':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
			case 'high':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
			default:
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-warning" />
						{title}
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className={`my-4 rounded-md p-4 ${getDangerColor()}`}>
					{itemToDelete ? (
						<p className="text-sm font-medium">
							You are about to delete:{' '}
							<span className="font-bold">{itemToDelete}</span>
						</p>
					) : (
						children
					)}
				</div>
				<DialogFooter className="sm:justify-start">
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
						className="w-full sm:w-auto"
					>
						{isDeleting ? (
							<>
								<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
								Deleting...
							</>
						) : (
							<>
								<Trash className="mr-2 h-4 w-4" />
								{deleteButtonText}
							</>
						)}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						className="mt-3 w-full sm:mt-0 sm:w-auto"
					>
						{cancelButtonText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
