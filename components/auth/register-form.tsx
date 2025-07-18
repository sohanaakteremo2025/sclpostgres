'use client'

import * as z from 'zod'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { AuthCardWrapper } from './auth-card-wrapper'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'

import { register } from '@/lib/actions/register.action'
import LoadingButton from '../loading-button'
import { isRegistrationActive } from '@/constants/constants'
import { useRouter } from 'next/navigation'

export const RegisterForm = () => {
	const [error, setError] = useState<string | undefined>('')
	const [success, setSuccess] = useState<string | undefined>('')
	const [isPending, startTransition] = useTransition()
	const router = useRouter()
	const form = useForm<z.infer<typeof RegisterSchema>>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			email: '',
			password: '',
			name: '',
		},
	})

	const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
		setError('')
		setSuccess('')

		startTransition(() => {
			register(values).then(data => {
				if (data?.error) {
					setError(data.error)
				}

				if (data?.success) {
					form.reset()
					setSuccess(data.success && 'Account created successfully.')
					// Redirect to login after successful registration with a slight delay
					setTimeout(() => {
						router.push('/login')
					}, 2000)
				}
			})
		})
	}

	return (
		<AuthCardWrapper
			headerLabel="Create an account"
			backButtonLabel="Already have an account?"
			backButtonHref="/login"
			showSocial={false}
		>
			{isRegistrationActive ? (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={isPending}
												placeholder="John Doe"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={isPending}
												placeholder="john.doe@example.com"
												type="email"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={isPending}
												placeholder="******"
												type="password"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormError message={error} />
						<FormSuccess message={success} />
						<LoadingButton isLoading={isPending} className="w-full">
							Register
						</LoadingButton>
					</form>
				</Form>
			) : (
				<h1 className="text-2xl font-bold text-center">
					Registration is currently disabled.
					<br />
					Please contact the administrator.
				</h1>
			)}
		</AuthCardWrapper>
	)
}
