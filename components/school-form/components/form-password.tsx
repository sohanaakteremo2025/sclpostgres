'use client'

import { useState } from 'react'
import { FieldValues, FieldPath } from 'react-hook-form'
import { FormField } from './form-field'
import { BaseFieldProps } from '../types/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormPasswordProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
	showStrengthIndicator?: boolean
	showToggleVisibility?: boolean
	minLength?: number
	requireUppercase?: boolean
	requireLowercase?: boolean
	requireNumbers?: boolean
	requireSpecialChars?: boolean
}

interface PasswordStrength {
	score: number
	label: string
	color: string
	requirements: {
		minLength: boolean
		uppercase: boolean
		lowercase: boolean
		numbers: boolean
		specialChars: boolean
	}
}

function calculatePasswordStrength(
	password: string,
	minLength = 8,
	requireUppercase = true,
	requireLowercase = true,
	requireNumbers = true,
	requireSpecialChars = true,
): PasswordStrength {
	const requirements = {
		minLength: password.length >= minLength,
		uppercase: requireUppercase ? /[A-Z]/.test(password) : true,
		lowercase: requireLowercase ? /[a-z]/.test(password) : true,
		numbers: requireNumbers ? /\d/.test(password) : true,
		specialChars: requireSpecialChars
			? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
			: true,
	}

	const metRequirements = Object.values(requirements).filter(Boolean).length
	const totalRequirements = Object.values(requirements).length
	const score = (metRequirements / totalRequirements) * 100

	let label = 'Very Weak'
	let color = 'bg-red-500'

	if (score >= 80) {
		label = 'Strong'
		color = 'bg-green-500'
	} else if (score >= 60) {
		label = 'Good'
		color = 'bg-yellow-500'
	} else if (score >= 40) {
		label = 'Fair'
		color = 'bg-orange-500'
	} else if (score >= 20) {
		label = 'Weak'
		color = 'bg-red-400'
	}

	return { score, label, color, requirements }
}

export function FormPassword<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	required,
	disabled,
	placeholder = 'Enter your password',
	showStrengthIndicator = true,
	showToggleVisibility = true,
	minLength = 8,
	requireUppercase = true,
	requireLowercase = true,
	requireNumbers = true,
	requireSpecialChars = true,
}: FormPasswordProps<TFieldValues, TName>) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<FormField
			name={name}
			label={label}
			description={description}
			required={required}
			disabled={disabled}
		>
			{({ value, onChange, onBlur, disabled: fieldDisabled }) => {
				const password = value || ''
				const strength = calculatePasswordStrength(
					password,
					minLength,
					requireUppercase,
					requireLowercase,
					requireNumbers,
					requireSpecialChars,
				)

				return (
					<div className="space-y-2">
						<div className="relative">
							<Input
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={e => onChange(e.target.value)}
								onBlur={onBlur}
								disabled={fieldDisabled}
								placeholder={placeholder}
								className={cn(showToggleVisibility && 'pr-10')}
							/>
							{showToggleVisibility && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
									disabled={fieldDisabled}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
									<span className="sr-only">
										{showPassword ? 'Hide password' : 'Show password'}
									</span>
								</Button>
							)}
						</div>

						{showStrengthIndicator && password && (
							<div className="space-y-2">
								{/* Strength bar */}
								<div className="space-y-1">
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">
											Password strength
										</span>
										<span
											className={cn(
												'font-medium',
												strength.score >= 80
													? 'text-green-600'
													: strength.score >= 60
														? 'text-yellow-600'
														: strength.score >= 40
															? 'text-orange-600'
															: 'text-red-600',
											)}
										>
											{strength.label}
										</span>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<div
											className={cn(
												'h-full transition-all duration-300',
												strength.color,
											)}
											style={{ width: `${strength.score}%` }}
										/>
									</div>
								</div>

								{/* Requirements checklist */}
								<div className="space-y-1 text-xs">
									<div className="flex items-center gap-2">
										{strength.requirements.minLength ? (
											<Check className="h-3 w-3 text-green-500" />
										) : (
											<X className="h-3 w-3 text-red-500" />
										)}
										<span
											className={cn(
												strength.requirements.minLength
													? 'text-green-600'
													: 'text-muted-foreground',
											)}
										>
											At least {minLength} characters
										</span>
									</div>
									{requireUppercase && (
										<div className="flex items-center gap-2">
											{strength.requirements.uppercase ? (
												<Check className="h-3 w-3 text-green-500" />
											) : (
												<X className="h-3 w-3 text-red-500" />
											)}
											<span
												className={cn(
													strength.requirements.uppercase
														? 'text-green-600'
														: 'text-muted-foreground',
												)}
											>
												Contains uppercase letter
											</span>
										</div>
									)}
									{requireLowercase && (
										<div className="flex items-center gap-2">
											{strength.requirements.lowercase ? (
												<Check className="h-3 w-3 text-green-500" />
											) : (
												<X className="h-3 w-3 text-red-500" />
											)}
											<span
												className={cn(
													strength.requirements.lowercase
														? 'text-green-600'
														: 'text-muted-foreground',
												)}
											>
												Contains lowercase letter
											</span>
										</div>
									)}
									{requireNumbers && (
										<div className="flex items-center gap-2">
											{strength.requirements.numbers ? (
												<Check className="h-3 w-3 text-green-500" />
											) : (
												<X className="h-3 w-3 text-red-500" />
											)}
											<span
												className={cn(
													strength.requirements.numbers
														? 'text-green-600'
														: 'text-muted-foreground',
												)}
											>
												Contains number
											</span>
										</div>
									)}
									{requireSpecialChars && (
										<div className="flex items-center gap-2">
											{strength.requirements.specialChars ? (
												<Check className="h-3 w-3 text-green-500" />
											) : (
												<X className="h-3 w-3 text-red-500" />
											)}
											<span
												className={cn(
													strength.requirements.specialChars
														? 'text-green-600'
														: 'text-muted-foreground',
												)}
											>
												Contains special character
											</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)
			}}
		</FormField>
	)
}
