import { toast } from 'sonner'

export type ServerActionResponse<T = unknown> = {
	success: boolean
	message: string
	data?: T
	errors?: Record<string, string[]>
	statusCode?: number
}

/**
 * Error class for server action failures with detailed information
 */
export class ServerActionError extends Error {
	public readonly statusCode: number
	public readonly errors?: Record<string, string[]>

	constructor(
		message: string,
		statusCode = 500,
		errors?: Record<string, string[]>,
	) {
		super(message)
		this.name = 'ServerActionError'
		this.statusCode = statusCode
		this.errors = errors
	}
}

/**
 * Utility wrapper for server actions to standardize responses and error handling
 * @param fn The server action function to wrap
 * @returns A function that returns a standardized response
 */
export function createServerAction<TInput, TOutput>(
	fn: (input: TInput) => Promise<TOutput>,
) {
	return async (input: TInput): Promise<ServerActionResponse<TOutput>> => {
		try {
			const result = await fn(input)
			return {
				success: true,
				message:
					result && typeof result === 'object' && 'message' in result
						? String(result.message)
						: 'Operation completed successfully',
				data: result,
				statusCode: 200,
			}
		} catch (error) {
			console.error('Server action error:', error)

			if (error instanceof ServerActionError) {
				return {
					success: false,
					message: error.message,
					errors: error.errors,
					statusCode: error.statusCode,
				}
			}

			return {
				success: false,
				message:
					error instanceof Error
						? error.message
						: 'An unexpected error occurred',
				statusCode: 500,
			}
		}
	}
}

// 2. Enhanced toast utilities that work with standardized responses

type EnhancedToastMessages<T> = {
	loading: string | (() => string)
	success?: string | ((response: ServerActionResponse<T>) => string)
	error?: string | ((error: ServerActionResponse | Error) => string)
}

/**
 * Displays toast notifications for server actions with standardized responses
 */
export async function serverActionToast<T>(
	promise: Promise<ServerActionResponse<T>>,
	messages: EnhancedToastMessages<T>,
): Promise<ServerActionResponse<T>> {
	const toastId = toast.loading(
		typeof messages.loading === 'function'
			? messages.loading()
			: messages.loading,
	)

	return promise
		.then(response => {
			if (response.success) {
				toast.success(
					messages.success
						? typeof messages.success === 'function'
							? messages.success(response)
							: messages.success
						: response.message,
					{ id: toastId },
				)
			} else {
				// Handle unsuccessful responses that didn't throw an error
				toast.error(
					messages.error
						? typeof messages.error === 'function'
							? messages.error(response)
							: messages.error
						: response.message,
					{ id: toastId },
				)
			}
			return response
		})
		.catch(error => {
			// Handle actual thrown errors (network failures, etc.)
			toast.error(
				messages.error
					? typeof messages.error === 'function'
						? messages.error(error)
						: messages.error
					: error instanceof Error
					? error.message
					: 'An unexpected error occurred',
				{ id: toastId },
			)
			throw error
		})
}
