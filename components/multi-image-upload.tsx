import React, { useState } from 'react'
import axios from 'axios'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Trash2 } from 'lucide-react'

interface ImageUploadProps {
	form: any
	formField?: string
	folder: string
	defaultImages?: string[]
	maxImages?: number
}

const MultiImageUpload: React.FC<ImageUploadProps> = ({
	form,
	formField = 'photos',
	folder,
	defaultImages = [],
	maxImages = 5,
}) => {
	const [images, setImages] = useState<string[]>(defaultImages)
	const [uploadStatus, setUploadStatus] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>('idle')
	const [uploadError, setUploadError] = useState<string | null>(null)

	const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		const remainingSlots = maxImages - images.length

		if (files.length > remainingSlots) {
			setUploadError(
				`You can only upload ${remainingSlots} more image${
					remainingSlots === 1 ? '' : 's'
				}`,
			)
			return
		}

		setUploadStatus('loading')
		setUploadError(null)

		const uploadPromises = files.map(async file => {
			const formData = new FormData()
			formData.append('image', file)
			formData.append('folder', folder)

			try {
				const response = await axios.post(
					process.env.NEXT_PUBLIC_UPLOAD_URL!,
					formData,
				)
				return response.data.url
			} catch (error) {
				throw new Error('Failed to upload image')
			}
		})

		try {
			const uploadedUrls = await Promise.all(uploadPromises)
			const newImages = [...images, ...uploadedUrls]
			setImages(newImages)
			form.setValue(formField, newImages)
			setUploadStatus('success')
		} catch (error) {
			console.error(error)
			setUploadStatus('error')
			setUploadError('Failed to upload one or more images')
		}
	}

	const handleRemoveImage = async (index: number) => {
		const imageUrl = images[index]
		const fileName = imageUrl.split('/').pop()
		const path = folder + '/' + fileName

		try {
			await axios.delete(process.env.NEXT_PUBLIC_DELETE_URL!, {
				data: { fileName: path },
			})

			const newImages = images.filter((_, i) => i !== index)
			setImages(newImages)
			form.setValue(formField, newImages)
			setUploadStatus('idle')
			setUploadError(null)
		} catch (error) {
			console.error(error)
			setUploadStatus('error')
			setUploadError('Failed to delete image')
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap gap-4 justify-center">
				{images.map((image, index) => (
					<div key={index} className="relative group">
						<Avatar className="w-32 h-32">
							<AvatarImage src={image} />
							<AvatarFallback className="bg-primary/10">PHOTO</AvatarFallback>
						</Avatar>
						<Button
							type="button"
							variant="destructive"
							size="icon"
							className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full"
							onClick={() => handleRemoveImage(index)}
						>
							<Trash2 className="w-3 h-3" />
						</Button>
					</div>
				))}

				{images.length < maxImages && (
					<div className="relative group">
						<Avatar className="w-32 h-32">
							<AvatarFallback className="bg-primary/10">
								<Label htmlFor="images" className="cursor-pointer">
									{uploadStatus === 'loading' ? (
										<Loader2 className="w-6 h-6 animate-spin" />
									) : (
										<Upload className="w-6 h-6" />
									)}
								</Label>
							</AvatarFallback>
						</Avatar>
						<Input
							id="images"
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={handleImagesChange}
							disabled={uploadStatus === 'loading'}
						/>
					</div>
				)}
			</div>
			{uploadError && (
				<p className="text-red-500 text-sm mt-2 text-center">{uploadError}</p>
			)}
		</div>
	)
}

export default MultiImageUpload
