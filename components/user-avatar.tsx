import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
	src?: string
	firstName: string
	lastName?: string
	className?: string
}

export const UserAvatar = ({
	src,
	firstName,
	lastName,
	className,
}: UserAvatarProps) => {
	// Generate initials
	const getInitials = () => {
		if (firstName && lastName) {
			return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
		}

		const nameParts = firstName.trim().split(' ')
		if (nameParts.length > 1) {
			return `${nameParts[0][0].toUpperCase()}${nameParts[
				nameParts.length - 1
			][0].toUpperCase()}`
		}

		// If only first name, use first two characters
		return firstName.slice(0, 2).toUpperCase()
	}

	// Generate fallback avatar URL
	const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${getInitials()}&background=random`

	return (
		<Avatar className={className}>
			<AvatarImage
				className="w-full h-full object-cover"
				src={src}
				alt={`${getInitials()} avatar`}
			/>
			<AvatarFallback>
				<img className="w-full h-full" src={fallbackAvatarUrl} alt="" />
			</AvatarFallback>
		</Avatar>
	)
}
