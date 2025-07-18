'use client'

import * as LucideIcons from 'lucide-react'
import { LucideProps } from 'lucide-react'
import { ComponentType } from 'react'
import { LucideIconName } from './types'

type LucideIconProps = {
	name: LucideIconName
} & LucideProps

export default function LucideIcon({ name, ...props }: LucideIconProps) {
	const Icon = LucideIcons[name] as ComponentType<LucideProps> | undefined

	if (!Icon) return null // fallback for unknown icon

	return <Icon {...props} />
}
