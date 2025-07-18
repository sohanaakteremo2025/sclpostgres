export interface ActionResponse<TData = any, TError = string> {
	success: boolean
	message: string
	data?: TData
	error?: TError
}
