'use client'

import { FC } from 'react'
import { VisuallyHidden } from '@react-aria/visually-hidden'
import { SwitchProps, useSwitch } from '@nextui-org/switch'
import { useTheme } from 'next-themes'
import { useIsSSR } from '@react-aria/ssr'
import clsx from 'clsx'

export interface ThemeSwitchProps {
	className?: string
	classNames?: SwitchProps['classNames']
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
	className,
	classNames,
}) => {
	const { theme, setTheme } = useTheme()
	const isSSR = useIsSSR()

	const onChange = () =>
		theme === 'light' ? setTheme('dark') : setTheme('light')

	const {
		Component,
		slots,
		isSelected,
		getBaseProps,
		getInputProps,
		getWrapperProps,
	} = useSwitch({
		isSelected: theme === 'light' || isSSR,
		'aria-label': `Switch to ${
			theme === 'light' || isSSR ? 'dark' : 'light'
		} mode`,
		onChange,
	})

	const SwitchComponent = Component as unknown as FC

	return (
		<SwitchComponent
			{...getBaseProps({
				className: clsx(
					'px-px transition-opacity hover:opacity-80 cursor-pointer',
					className,
					classNames?.base,
				),
			})}
		>
			<VisuallyHidden>
				<input {...getInputProps()} />
			</VisuallyHidden>
			<div
				{...getWrapperProps()}
				className={slots.wrapper({
					class: clsx(
						[
							'w-auto h-auto',
							'bg-transparent',
							'rounded-lg',
							'flex items-center justify-center',
							'group-data-[selected=true]:bg-transparent',
							'!text-default-500',
							'pt-px',
							'px-0',
							'mx-0',
						],
						classNames?.wrapper,
					),
				})}
			>
				{!isSelected || isSSR ? (
					<div className="inline-flex items-center justify-center h-8 w-8 rounded-full overflow-hidden transition-all  text-slate-300 bg-slate-800">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon"
							className="h-4"
						>
							<path
								fillRule="evenodd"
								d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
								clipRule="evenodd"
							></path>
						</svg>
					</div>
				) : (
					<div className="inline-flex items-center justify-center h-8 w-8 rounded-full overflow-hidden transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-200">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon"
							className="h-5"
						>
							<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"></path>
						</svg>
					</div>
				)}
			</div>
		</SwitchComponent>
	)
}
