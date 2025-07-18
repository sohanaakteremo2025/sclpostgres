'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// import { newVerification } from '@/lib/actions/auth-verification.action'
import { AuthCardWrapper } from './auth-card-wrapper'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { Loader } from 'lucide-react'

export const NewVerificationForm = () => {
	const [error, setError] = useState<string | undefined>()
	const [success, setSuccess] = useState<string | undefined>()

	const searchParams = useSearchParams()

	const token = searchParams.get('token')

	const onSubmit = useCallback(() => {
		// if (success || error) return
		// if (!token) {
		// 	setError('Missing token!')
		// 	return
		// }
		// newVerification(token)
		// 	.then(data => {
		// 		setSuccess(data.success)
		// 		setError(data.error)
		// 	})
		// 	.catch(() => {
		// 		setError('Something went wrong!')
		// 	})
	}, [token, success, error])

	useEffect(() => {
		onSubmit()
	}, [onSubmit])

	return (
		<AuthCardWrapper
			headerLabel="Confirming your verification"
			backButtonLabel="Back to login"
			backButtonHref="/login"
		>
			<div className="flex items-center w-full justify-center">
				{!success && !error && <Loader className="animate-spin" />}
				<FormSuccess message={success} />
				{!success && <FormError message={error} />}
			</div>
		</AuthCardWrapper>
	)
}
