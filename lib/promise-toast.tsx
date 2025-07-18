import { toast } from 'sonner'

type ToastMessages<T> = {
	loading: string | (() => string)
	success: string | ((data: T) => string)
	error: string | ((error: Error) => string)
}

/**
 * Displays a toast notification for a promise with loading, success, and error states.
 *
 * @param promiseFn - A function that returns a promise to handle.
 * @param messages - Messages for different toast states.
 * @returns The original promise, allowing further chaining or awaiting.
 */
export function promiseToast<T>(
	promise: Promise<T>,
	messages: ToastMessages<T>,
): Promise<T> {
	// Display toast notifications based on the promise state
	toast.promise(promise, {
		loading:
			typeof messages.loading === 'function'
				? messages.loading()
				: messages.loading,
		success: data =>
			typeof messages.success === 'function'
				? messages.success(data)
				: messages.success,
		error: error =>
			typeof messages.error === 'function'
				? messages.error(error)
				: messages.error,
	})

	// Return the original promise for further handling
	return promise
}
