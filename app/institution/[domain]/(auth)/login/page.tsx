'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { LoginSchema } from '@/schemas'
import { Input } from '@/components/ui/input'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FormSuccess } from '@/components/form-success'
import { login } from '@/lib/actions/auth.action'
import {
	EyeIcon,
	EyeOffIcon,
	LockIcon,
	MailIcon,
	AlertCircleIcon,
	ArrowLeftIcon,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useParams } from 'next/navigation'

export default function Login() {
	const router = useRouter()
	const params = useParams()
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl')
	const domain = params.domain

	// Handle OAuth error
	const urlError =
		searchParams.get('error') === 'OAuthAccountNotLinked'
			? 'Email already in use with different provider!'
			: ''

	const [error, setError] = useState<string | undefined>('')
	const [success, setSuccess] = useState<string | undefined>('')
	const [isPending, startTransition] = useTransition()
	const [showPassword, setShowPassword] = useState(false)

	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		setError('')
		setSuccess('')

		startTransition(() => {
			login(values, callbackUrl).then(data => {
				if (data?.error) {
					setError(data.error)
					// No need to reset the form on error - users might want to correct just one field
				}

				if (data?.success) {
					// Show success message briefly
					setSuccess(data.success)

					// Handle redirect on client-side after successful server authentication
					if (data.redirectUrl) {
						// Short timeout to show success message before redirecting
						setTimeout(() => {
							router.push(data.redirectUrl)
							router.refresh() // Refresh to update auth state in the UI
						}, 800)
					}
				}
			})
		})
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	// Custom error display component for better visibility
	const ErrorDisplay = ({ message }: { message: string }) => {
		if (!message) return null

		return (
			<Alert
				variant="destructive"
				className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg mb-4"
			>
				<AlertCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
				<AlertDescription className="text-red-600 dark:text-red-400 ml-2 text-sm font-medium">
					{message}
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
			{/* Back to home button */}
			<div className="mb-6">
				<Button
					variant="ghost"
					size="sm"
					asChild
					className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors"
				>
					<Link href="/">
						<ArrowLeftIcon className="h-4 w-4" />
						<span>Back to Home</span>
					</Link>
				</Button>
			</div>

			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Welcome Back
				</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
					Sign in to your{' '}
					<span className="text-primary font-medium">{domain}</span> account
				</p>
			</div>

			{/* Display form-level error messages */}
			{(error || urlError) && <ErrorDisplay message={error || urlError} />}

			{/* Display success message */}
			{success && <FormSuccess message={success} />}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Email
								</FormLabel>
								<FormControl>
									<div className="relative">
										<div className="absolute left-3 top-3.5 text-primary">
											<MailIcon className="h-5 w-5" />
										</div>
										<Input
											{...field}
											disabled={isPending}
											placeholder="your@email.com"
											className="pl-10 h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
										/>
									</div>
								</FormControl>
								<FormMessage className="text-red-500 text-xs mt-1" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="flex justify-between items-center">
									<FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
										Password
									</FormLabel>
									<Button
										size="sm"
										variant="link"
										asChild
										className="p-0 h-auto text-xs font-medium text-primary hover:text-primary/90"
									>
										<Link href="/auth/reset">Forgot password?</Link>
									</Button>
								</div>
								<FormControl>
									<div className="relative">
										<div className="absolute left-3 top-3.5 text-primary">
											<LockIcon className="h-5 w-5" />
										</div>
										<Input
											{...field}
											disabled={isPending}
											placeholder="••••••••"
											type={showPassword ? 'text' : 'password'}
											className="pl-10 pr-10 h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
										/>
										<button
											type="button"
											onClick={togglePasswordVisibility}
											className="absolute right-3 top-3.5 text-zinc-500 hover:text-primary focus:outline-none transition-colors"
											aria-label={
												showPassword ? 'Hide password' : 'Show password'
											}
										>
											{showPassword ? (
												<EyeOffIcon className="h-5 w-5" />
											) : (
												<EyeIcon className="h-5 w-5" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage className="text-red-500 text-xs mt-1" />
							</FormItem>
						)}
					/>

					<Button
						disabled={isPending}
						type="submit"
						className="w-full h-12 text-white bg-primary hover:bg-primary/90 rounded-lg font-medium text-base transition-all shadow-md hover:shadow-lg hover:translate-y-px"
					>
						{isPending ? (
							<div className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								<span>Signing in...</span>
							</div>
						) : (
							<span>Sign In</span>
						)}
					</Button>
				</form>
			</Form>

			<div className="mt-6 text-center text-sm">
				<span className="text-zinc-500 dark:text-zinc-400">
					Don't have an account?{' '}
				</span>
				<Link
					href="/register"
					className="font-medium text-primary hover:text-primary/90 transition-colors"
				>
					Create one
				</Link>
			</div>
		</div>
	)
}
