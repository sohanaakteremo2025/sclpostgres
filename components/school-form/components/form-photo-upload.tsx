'use client'

import { FieldValues, Path } from 'react-hook-form'
import { FormField } from './form-field'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, User, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FormPhotoUploadProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
	name: TName
	label?: string
	description?: string
	required?: boolean
	disabled?: boolean
	maxSize?: number // in KB
	acceptedTypes?: string[]
	uploadUrl: string
	uploadPath?: string
}

export function FormPhotoUpload<
	TFieldValues extends FieldValues = FieldValues,
	TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	maxSize = 2048,
	acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
	uploadUrl,
	uploadPath = '',
}: FormPhotoUploadProps<TFieldValues, TName>) {
	const [preview, setPreview] = useState<string | null>(null)
	const [dragOver, setDragOver] = useState(false)
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Upload file to server
	const uploadFileToServer = async (file: File, oldFileUrl?: string) => {
		const formData = new FormData()
		formData.append('image', file)

		if (uploadPath) {
			formData.append('folder', uploadPath)
		}

		// Send old file URL for deletion if replacing
		if (oldFileUrl) {
			formData.append('oldUrl', oldFileUrl)
		}

		const response = await fetch(uploadUrl, {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(
				errorData.error || `Upload failed: ${response.statusText}`,
			)
		}

		const result = await response.json()

		if (result.error) {
			throw new Error(result.error)
		}

		if (!result.url) {
			throw new Error('Upload failed - no URL returned')
		}

		return result.url
	}

	// Delete file from server
	const deleteFileFromServer = async (fileUrl: string) => {
		try {
			const response = await fetch(uploadUrl, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					url: fileUrl,
					folder: uploadPath,
				}),
			})

			if (response.ok) {
				const result = await response.json()
				return result.success !== false
			}
			return false
		} catch (error) {
			console.warn('Failed to delete file:', error)
			return false
		}
	}

	// Handle file selection and upload
	const handleFileUpload = async (
		file: File,
		formOnChange: (value: string) => void,
		currentValue?: string,
	) => {
		// Validate file type
		if (!acceptedTypes.includes(file.type)) {
			toast.error(
				`Please select a valid image file (${acceptedTypes.join(', ')})`,
			)
			return
		}

		// Validate file size
		if (file.size > maxSize * 1024) {
			toast.error(`File size must be less than ${maxSize}KB`)
			return
		}

		// Create preview
		const reader = new FileReader()
		reader.onload = () => setPreview(reader.result as string)
		reader.readAsDataURL(file)

		// Upload to server
		setUploading(true)
		try {
			const uploadedUrl = await uploadFileToServer(file, currentValue)
			formOnChange(uploadedUrl)
			toast.success('Image uploaded successfully!')
		} catch (error) {
			console.error('Upload error:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to upload image',
			)
			setPreview(null)
		} finally {
			setUploading(false)
		}
	}

	// Handle remove/clear
	const handleRemove = async (
		formOnChange: (value: string) => void,
		currentValue?: string,
	) => {
		// Delete from server if file exists
		if (currentValue) {
			setUploading(true)
			try {
				const deleted = await deleteFileFromServer(currentValue)
				if (deleted) {
					toast.success('Image removed successfully!')
				} else {
					toast.warning(
						'Image removed from form (server deletion may have failed)',
					)
				}
			} catch (error) {
				console.error('Delete error:', error)
				toast.warning('Image removed from form (server deletion failed)')
			} finally {
				setUploading(false)
			}
		}

		// Clear form and preview
		setPreview(null)
		formOnChange('')
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	// Drag and drop handlers
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		setDragOver(true)
	}

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		setDragOver(false)
	}

	const handleDrop = (
		e: React.DragEvent,
		formOnChange: (value: string) => void,
		currentValue?: string,
	) => {
		e.preventDefault()
		setDragOver(false)

		const files = e.dataTransfer.files
		if (files.length > 0) {
			handleFileUpload(files[0], formOnChange, currentValue)
		}
	}

	return (
		<FormField
			name={name}
			label={label}
			description={description}
			required={required}
			disabled={disabled}
		>
			{({ value, onChange, disabled: fieldDisabled }) => (
				<div className="space-y-4">
					{/* Photo Preview Area */}
					<div className="flex items-start gap-4">
						<div
							className={cn(
								'relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden transition-colors',
								dragOver && !fieldDisabled && !uploading
									? 'border-blue-400 bg-blue-50'
									: 'border-gray-300',
								(fieldDisabled || uploading) && 'opacity-50 cursor-not-allowed',
							)}
							onDragOver={
								!fieldDisabled && !uploading ? handleDragOver : undefined
							}
							onDragLeave={
								!fieldDisabled && !uploading ? handleDragLeave : undefined
							}
							onDrop={
								!fieldDisabled && !uploading
									? e => handleDrop(e, onChange, value)
									: undefined
							}
						>
							{uploading ? (
								<div className="text-center">
									<Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
									<p className="text-xs text-gray-500">Uploading...</p>
								</div>
							) : preview || value ? (
								<>
									<img
										src={preview || value}
										alt="Preview"
										className="w-full h-full object-cover"
									/>
									{!fieldDisabled && (
										<button
											type="button"
											onClick={() => handleRemove(onChange, value)}
											disabled={uploading}
											className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
										>
											<X className="w-3 h-3" />
										</button>
									)}
								</>
							) : (
								<div className="text-center">
									<User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
									<p className="text-xs text-gray-500">
										{dragOver ? 'Drop image here' : 'Drag & drop or click'}
									</p>
								</div>
							)}
						</div>

						{/* Upload Controls */}
						<div className="flex-1 space-y-2">
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									disabled={fieldDisabled || uploading}
									className="flex items-center gap-2"
								>
									{uploading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Upload className="w-4 h-4" />
									)}
									{uploading ? 'Uploading...' : 'Choose Photo'}
								</Button>

								{(preview || value) && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleRemove(onChange, value)}
										disabled={fieldDisabled || uploading}
										className="text-red-600 hover:text-red-700"
									>
										Remove
									</Button>
								)}
							</div>

							<div className="text-xs text-muted-foreground space-y-1">
								<p>Accepted formats: JPG, PNG, GIF</p>
								<p>Maximum size: {maxSize}KB</p>
								<p>Recommended: Square image, 400x400px</p>
							</div>
						</div>
					</div>

					{/* Hidden File Input */}
					<input
						ref={fileInputRef}
						type="file"
						accept={acceptedTypes.join(',')}
						className="hidden"
						onChange={e => {
							const file = e.target.files?.[0]
							if (file) {
								handleFileUpload(file, onChange, value)
							}
						}}
						disabled={fieldDisabled || uploading}
					/>
				</div>
			)}
		</FormField>
	)
}
