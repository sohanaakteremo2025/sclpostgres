'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { RegisterSchema } from '@/schemas'
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
import { register } from '@/lib/actions/auth.action'
import {
	EyeIcon,
	EyeOffIcon,
	LockIcon,
	MailIcon,
	UserIcon,
	AlertCircleIcon,
	CheckCircleIcon,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { isRegistrationActive } from '@/constants/constants'

export default function Register() {
	const router = useRouter()
	const [error, setError] = useState<string | undefined>('')
	const [success, setSuccess] = useState<string | undefined>('')
	const [isPending, startTransition] = useTransition()
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const form = useForm<z.infer<typeof RegisterSchema>>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
			role: UserRole.STUDENT,
			photo: '',
		},
	})

	const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
		setError('')
		setSuccess('')

		startTransition(() => {
			register(values).then(data => {
				if (data?.error) {
					setError(data.error)
				}

				if (data?.success) {
					form.reset()
					setSuccess(data.success)

					// Redirect to login after successful registration with a slight delay
					setTimeout(() => {
						router.push('/login')
					}, 2000)
				}
			})
		})
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword)
	}

	// Custom error display component
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

	// Custom success display component
	const SuccessDisplay = ({ message }: { message: string }) => {
		if (!message) return null

		return (
			<Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg mb-4">
				<CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
				<AlertDescription className="text-green-600 dark:text-green-400 ml-2 text-sm font-medium">
					{message}
				</AlertDescription>
			</Alert>
		)
	}

	// registration stopped currently
	if (!isRegistrationActive) {
		return <div>Registration is currently stopped</div>
	}

	return (
		<div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-dark rounded-xl shadow-lg">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Create Account
				</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
					Sign up to get started with our platform
				</p>
			</div>

			{/* Display error message */}
			{error && <ErrorDisplay message={error} />}

			{/* Display success message */}
			{success && <SuccessDisplay message={success} />}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{/* Name Field */}
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Full Name
								</FormLabel>
								<FormControl>
									<div className="relative">
										<div className="absolute left-3 top-3.5 text-primary">
											<UserIcon className="h-5 w-5" />
										</div>
										<Input
											{...field}
											disabled={isPending}
											placeholder="John Doe"
											className="pl-10 h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30 focus-visible:border-primary"
										/>
									</div>
								</FormControl>
								<FormMessage className="text-red-500 text-xs mt-1" />
							</FormItem>
						)}
					/>

					{/* Email Field */}
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
											type="email"
											className="pl-10 h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30 focus-visible:border-primary"
										/>
									</div>
								</FormControl>
								<FormMessage className="text-red-500 text-xs mt-1" />
							</FormItem>
						)}
					/>

					{/* Password Field */}
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Password
								</FormLabel>
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
											className="pl-10 pr-10 h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30 focus-visible:border-primary"
										/>
										<button
											type="button"
											onClick={togglePasswordVisibility}
											className="absolute right-3 top-3.5 text-zinc-500 hover:text-primary focus:outline-none"
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
								<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
									Must contain at least 8 characters, including uppercase,
									lowercase and numbers.
								</p>
							</FormItem>
						)}
					/>

					{/* Confirm Password Field */}
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Confirm Password
								</FormLabel>
								<FormControl>
									<div className="relative">
										<div className="absolute left-3 top-3.5 text-primary">
											<LockIcon className="h-5 w-5" />
										</div>
										<Input
											{...field}
											disabled={isPending}
											placeholder="••••••••"
											type={showConfirmPassword ? 'text' : 'password'}
											className="pl-10 pr-10 h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30 focus-visible:border-primary"
										/>
										<button
											type="button"
											onClick={toggleConfirmPasswordVisibility}
											className="absolute right-3 top-3.5 text-zinc-500 hover:text-primary focus:outline-none"
											aria-label={
												showConfirmPassword
													? 'Hide confirm password'
													: 'Show confirm password'
											}
										>
											{showConfirmPassword ? (
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

					{/* Role Selection */}
					<FormField
						control={form.control}
						name="role"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Role
								</FormLabel>
								<Select
									disabled={isPending}
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30 focus-visible:border-primary">
											<SelectValue placeholder="Select your role" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
										<SelectItem value={UserRole.SUPER_ADMIN}>
											Super Admin
										</SelectItem>
										<SelectItem value={UserRole.STUDENT}>Student</SelectItem>
										<SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
										<SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage className="text-red-500 text-xs mt-1" />
							</FormItem>
						)}
					/>

					{/* Submit Button */}
					<Button
						disabled={isPending}
						type="submit"
						className="w-full h-12 mt-6 text-white bg-primary hover:bg-purple-800 rounded-lg font-medium text-base transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
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
								<span>Creating Account...</span>
							</div>
						) : (
							<span>Create Account</span>
						)}
					</Button>
				</form>
			</Form>

			<div className="mt-6 text-center text-sm">
				<span className="text-zinc-500 dark:text-zinc-400">
					Already have an account?{' '}
				</span>
				<Link
					href="/login"
					className="font-medium text-primary hover:text-purple-800"
				>
					Sign in
				</Link>
			</div>
		</div>
	)
}
