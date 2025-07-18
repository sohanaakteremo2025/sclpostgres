import type { ExtendedColumnFilter, JoinOperator } from '../types/data-table'
import { addDays, endOfDay, startOfDay } from 'date-fns'
import type { Prisma } from '@prisma/client'

export function filterColumns<T extends Record<string, any>>({
	filters,
	joinOperator,
}: {
	filters: ExtendedColumnFilter<T>[]
	joinOperator: JoinOperator
}): Prisma.InputJsonObject | undefined {
	const conditions: Prisma.InputJsonObject[] = []

	filters.forEach(filter => {
		const column = filter.id
		let condition: Prisma.InputJsonObject | undefined

		switch (filter.operator) {
			case 'iLike':
				if (filter.variant === 'text' && typeof filter.value === 'string') {
					condition = {
						[column]: {
							contains: filter.value,
							mode: 'insensitive',
						},
					}
				}
				break

			case 'notILike':
				if (filter.variant === 'text' && typeof filter.value === 'string') {
					condition = {
						NOT: {
							[column]: {
								contains: filter.value,
								mode: 'insensitive',
							},
						},
					}
				}
				break

			case 'eq':
				if (filter.variant === 'boolean' && typeof filter.value === 'string') {
					condition = { [column]: filter.value === 'true' }
				} else if (
					filter.variant === 'date' ||
					filter.variant === 'dateRange'
				) {
					const date = new Date(Number(filter.value))
					date.setHours(0, 0, 0, 0)
					const end = new Date(date)
					end.setHours(23, 59, 59, 999)
					condition = {
						AND: [{ [column]: { gte: date } }, { [column]: { lte: end } }],
					}
				} else {
					condition = { [column]: filter.value }
				}
				break

			case 'ne':
				if (filter.variant === 'boolean' && typeof filter.value === 'string') {
					condition = { [column]: { not: filter.value === 'true' } }
				} else if (
					filter.variant === 'date' ||
					filter.variant === 'dateRange'
				) {
					const date = new Date(Number(filter.value))
					date.setHours(0, 0, 0, 0)
					const end = new Date(date)
					end.setHours(23, 59, 59, 999)
					condition = {
						OR: [{ [column]: { lt: date } }, { [column]: { gt: end } }],
					}
				} else {
					condition = { [column]: { not: filter.value } }
				}
				break

			case 'inArray':
				if (Array.isArray(filter.value)) {
					condition = { [column]: { in: filter.value } }
				}
				break

			case 'notInArray':
				if (Array.isArray(filter.value)) {
					condition = { [column]: { notIn: filter.value } }
				}
				break

			case 'lt':
				if (filter.variant === 'number' || filter.variant === 'range') {
					condition = { [column]: { lt: filter.value } }
				} else if (
					filter.variant === 'date' &&
					typeof filter.value === 'string'
				) {
					condition = { [column]: { lt: new Date(Number(filter.value)) } }
				}
				break

			case 'lte':
				if (filter.variant === 'number' || filter.variant === 'range') {
					condition = { [column]: { lte: filter.value } }
				} else if (
					filter.variant === 'date' &&
					typeof filter.value === 'string'
				) {
					condition = { [column]: { lte: new Date(Number(filter.value)) } }
				}
				break

			case 'gt':
				if (filter.variant === 'number' || filter.variant === 'range') {
					condition = { [column]: { gt: filter.value } }
				} else if (
					filter.variant === 'date' &&
					typeof filter.value === 'string'
				) {
					condition = { [column]: { gt: new Date(Number(filter.value)) } }
				}
				break

			case 'gte':
				if (filter.variant === 'number' || filter.variant === 'range') {
					condition = { [column]: { gte: filter.value } }
				} else if (
					filter.variant === 'date' &&
					typeof filter.value === 'string'
				) {
					condition = { [column]: { gte: new Date(Number(filter.value)) } }
				}
				break

			case 'isBetween':
				if (
					(filter.variant === 'date' || filter.variant === 'dateRange') &&
					Array.isArray(filter.value) &&
					filter.value.length === 2
				) {
					const startDate = filter.value[0]
						? new Date(Number(filter.value[0]))
						: null
					const endDate = filter.value[1]
						? new Date(Number(filter.value[1]))
						: null

					if (startDate && endDate) {
						startDate.setHours(0, 0, 0, 0)
						endDate.setHours(23, 59, 59, 999)
						condition = {
							AND: [
								{ [column]: { gte: startDate } },
								{ [column]: { lte: endDate } },
							],
						}
					} else if (startDate) {
						startDate.setHours(0, 0, 0, 0)
						condition = { [column]: { gte: startDate } }
					} else if (endDate) {
						endDate.setHours(23, 59, 59, 999)
						condition = { [column]: { lte: endDate } }
					}
				} else if (
					(filter.variant === 'number' || filter.variant === 'range') &&
					Array.isArray(filter.value) &&
					filter.value.length === 2
				) {
					const firstValue =
						filter.value[0] && filter.value[0].trim() !== ''
							? Number(filter.value[0])
							: null
					const secondValue =
						filter.value[1] && filter.value[1].trim() !== ''
							? Number(filter.value[1])
							: null

					if (firstValue !== null && secondValue !== null) {
						condition = {
							AND: [
								{ [column]: { gte: firstValue } },
								{ [column]: { lte: secondValue } },
							],
						}
					} else if (firstValue !== null) {
						condition = { [column]: firstValue }
					} else if (secondValue !== null) {
						condition = { [column]: secondValue }
					}
				}
				break

			case 'isRelativeToToday':
				if (
					(filter.variant === 'date' || filter.variant === 'dateRange') &&
					typeof filter.value === 'string'
				) {
					const today = new Date()
					const [amount, unit] = filter.value.split(' ') ?? []
					let startDate: Date | null = null
					let endDate: Date | null = null

					if (amount && unit) {
						switch (unit) {
							case 'days':
								startDate = startOfDay(addDays(today, Number.parseInt(amount)))
								endDate = endOfDay(startDate)
								break
							case 'weeks':
								startDate = startOfDay(
									addDays(today, Number.parseInt(amount) * 7),
								)
								endDate = endOfDay(addDays(startDate, 6))
								break
							case 'months':
								startDate = startOfDay(
									addDays(today, Number.parseInt(amount) * 30),
								)
								endDate = endOfDay(addDays(startDate, 29))
								break
							default:
								break
						}

						if (startDate && endDate) {
							condition = {
								AND: [
									{ [column]: { gte: startDate } },
									{ [column]: { lte: endDate } },
								],
							}
						}
					}
				}
				break
			case 'isEmpty':
				condition = { [column]: null }
				break

			case 'isNotEmpty':
				condition = { [column]: { not: null } }
				break

			default:
				throw new Error(`Unsupported operator: ${filter.operator}`)
		}

		if (condition) {
			conditions.push(condition)
		}
	})

	if (conditions.length === 0) {
		return undefined
	}

	return joinOperator === 'and' ? { AND: conditions } : { OR: conditions }
}
