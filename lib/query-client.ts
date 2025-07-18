import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
			retry: (failureCount, error) => {
				if (error?.message.includes('404')) return false
				return failureCount < 3
			},
		},
	},
})

export const invalidateQueries = (queryKey: string[]) => {
	queryClient.invalidateQueries({
		queryKey,
	})
}
