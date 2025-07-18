import Image from 'next/image'

export default function TenantLogo({
	className = '',
	size = 'default',
	name = 'Edu Academy',
	src,
}: {
	className?: string
	size?: 'default' | 'large' | 'small'
	name?: string
	src?: string
}) {
	const sizes = {
		small: 'h-8 w-8 text-sm',
		default: 'h-12 w-12 text-xl',
		large: 'h-20 w-20 text-2xl',
	}

	const logoSizes = {
		small: 'h-8 w-8',
		default: 'h-12 w-12',
		large: 'h-20 w-20',
	}

	const textSizes = {
		small: 'text-sm',
		default: 'text-xl',
		large: 'text-2xl',
	}

	return (
		<div className={`relative ${className}`}>
			<div className="flex items-center gap-3">
				{/* Monogram Logo - Rounded */}
				<div className={`${logoSizes[size]} overflow-hidden rounded-full`}>
					<Image
						src={src || '/logo.png'}
						alt={`${name} Logo`}
						width={300}
						height={300}
						priority
						className="object-cover w-full h-full"
					/>
				</div>

				{/* School Name */}
				<span className={`font-bold text-white ${textSizes[size]}`}>
					{name}
				</span>
			</div>
		</div>
	)
}
