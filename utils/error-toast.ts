// utils/error-handler.ts
import { toast } from 'sonner'

export class AppError extends Error {
	constructor(message: string, public code?: string, public status?: number) {
		super(message)
		this.name = 'AppError'
	}
}

export const handleErrorToast = (error: unknown) => {
	console.error('Error:', error)

	if (error instanceof AppError) {
		toast.error(error.message)
		return error
	}

	if (error instanceof Error) {
		toast.error(error.message)
		return new AppError(error.message)
	}

	// For unknown errors
	const message = 'An unexpected error occurred'
	toast.error(message)
	return new AppError(message)
}
