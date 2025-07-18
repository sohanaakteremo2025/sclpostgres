// components/Logo/Logo.tsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
	title: string
	logoUrl: string
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	variant?: 'horizontal' | 'vertical' | 'logo-only' | 'text-only'
	className?: string
	textClassName?: string
	logoClassName?: string
	maxTextLength?: number
}

export function Logo({
	title,
	logoUrl,
	size = 'md',
	variant = 'horizontal',
	className,
	textClassName,
	logoClassName,
	maxTextLength,
}: LogoProps) {
	// Default values if props are empty
	const schoolName = title || 'School Name'
	const logoSrc = logoUrl || '/default-school-logo.svg'

	// Size mappings for logo dimensions
	const sizeMap = {
		xs: { logo: 24, text: 'text-xs' },
		sm: { logo: 32, text: 'text-sm' },
		md: { logo: 40, text: 'text-base' },
		lg: { logo: 48, text: 'text-lg' },
		xl: { logo: 64, text: 'text-xl' },
	}

	// Truncate text if it's too long
	const formatSchoolName = (name: string) => {
		if (!maxTextLength) return name

		return name.length > maxTextLength
			? `${name.substring(0, maxTextLength)}...`
			: name
	}

	// Handle text wrapping for different variants
	const getTextStyles = () => {
		const baseStyles = cn(
			'font-semibold leading-tight',
			sizeMap[size].text,
			textClassName,
		)

		if (variant === 'vertical') {
			return cn(baseStyles, 'text-center mt-2')
		}

		return cn(baseStyles, 'ml-2')
	}

	// Logo only variant
	if (variant === 'logo-only') {
		return (
			<div className={cn('flex items-center justify-center', className)}>
				<Image
					src={logoSrc}
					alt={schoolName}
					width={sizeMap[size].logo}
					height={sizeMap[size].logo}
					className={cn('rounded-full object-contain', logoClassName)}
					priority
				/>
			</div>
		)
	}

	// Text only variant
	if (variant === 'text-only') {
		return (
			<div className={cn('flex items-center', className)}>
				<span className={getTextStyles()}>{formatSchoolName(schoolName)}</span>
			</div>
		)
	}

	// Vertical layout
	if (variant === 'vertical') {
		return (
			<div className={cn('flex flex-col items-center', className)}>
				<Image
					src={logoSrc}
					alt={schoolName}
					width={sizeMap[size].logo}
					height={sizeMap[size].logo}
					className={cn('rounded-full object-contain', logoClassName)}
					priority
				/>
				<span className={getTextStyles()}>{formatSchoolName(schoolName)}</span>
			</div>
		)
	}

	// Default: horizontal layout
	return (
		<div className={cn('flex items-center', className)}>
			<Image
				src={logoSrc}
				alt={schoolName}
				width={sizeMap[size].logo}
				height={sizeMap[size].logo}
				className={cn('rounded-full object-contain', logoClassName)}
				priority
			/>
			<span className={getTextStyles()}>{formatSchoolName(schoolName)}</span>
		</div>
	)
}
