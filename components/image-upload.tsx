'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface ImageUploadProps {
	form: any
	formField: string
	folder: string
	defaultImage?: string
	placeholder?: string
}

const SingleImageUpload: React.FC<ImageUploadProps> = ({
	form,
	formField,
	folder,
	defaultImage,
	placeholder = 'image',
}) => {
	const [uploadStatus, setUploadStatus] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>('idle')
	const [uploadError, setUploadError] = useState<string | null>(null)

	// Get the current image value from the form
	const currentImage = form.watch(formField)

	// Update form value when defaultImage changes
	useEffect(() => {
		if (defaultImage && !currentImage) {
			form.setValue(formField, defaultImage)
		}
	}, [defaultImage, formField, form, currentImage])

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setUploadStatus('loading')
			setUploadError(null)

			const formData = new FormData()
			formData.append('image', file)
			formData.append('folder', folder)

			try {
				const response = await axios.post(
					process.env.NEXT_PUBLIC_UPLOAD_URL!,
					formData,
				)
				form.setValue(formField, response.data.url)
				setUploadStatus('success')
			} catch (error) {
				console.error(error)
				setUploadStatus('error')
				setUploadError('Failed to upload image. Please try again.')
			}
		}
	}

	const handleRemoveImage = async () => {
		if (currentImage) {
			const fileName = currentImage.split('/').pop()
			const path = folder + '/' + fileName

			try {
				const response = await axios.delete(
					process.env.NEXT_PUBLIC_DELETE_URL!,
					{
						data: { fileName: path },
					},
				)

				if (response.data.success) {
					form.setValue(formField, '')
					setUploadStatus('idle')
					setUploadError(null)
				} else {
					setUploadStatus('error')
					setUploadError('Failed to delete image. Please try again.')
				}
			} catch (error) {
				console.error(error)
				setUploadStatus('error')
				setUploadError('Failed to delete image. Please try again.')
			}
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-center">
				<div className="relative group">
					<Avatar className="w-32 h-32">
						<AvatarImage src={currentImage || ''} />
						<AvatarFallback className="bg-primary/10">
							{placeholder}
						</AvatarFallback>
					</Avatar>
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
						<Label
							htmlFor={`avatar-${formField}`}
							className="cursor-pointer flex items-center justify-center w-full h-full rounded-full bg-black/50 text-white"
						>
							{uploadStatus === 'loading' ? (
								<Loader2 className="w-6 h-6 animate-spin" />
							) : (
								<Upload className="w-6 h-6" />
							)}
						</Label>
						<Input
							id={`avatar-${formField}`}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleAvatarChange}
							disabled={uploadStatus === 'loading'}
						/>
					</div>
					{currentImage && uploadStatus !== 'loading' && (
						<Button
							type="button"
							variant="destructive"
							size="icon"
							className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full"
							onClick={handleRemoveImage}
						>
							<Trash2 className="w-3 h-3" />
						</Button>
					)}
					{uploadStatus === 'success' && (
						<div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
							<CheckCircle className="w-4 h-4 text-white" />
						</div>
					)}
					{uploadStatus === 'error' && (
						<div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
							<XCircle className="w-4 h-4 text-white" />
						</div>
					)}
				</div>
			</div>
			{uploadError && (
				<p className="text-red-500 text-sm mt-2 text-center">{uploadError}</p>
			)}
		</div>
	)
}

export default SingleImageUpload
