import { format, parse } from 'date-fns'

export function formatTime(time: string) {
	const formattedTime = format(parse(time, 'HH:mm', new Date()), 'h:mma')
	return formattedTime
}
