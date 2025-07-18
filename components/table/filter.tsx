import * as React from 'react'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '../ui/checkbox'

interface DataTableFacetedFilterProps<TData, TValue> {
	columnTitle: string
	table: Table<TData>
}

export function TableFilter<TData, TValue>({
	columnTitle,
	table,
}: DataTableFacetedFilterProps<TData, TValue>) {
	const column = table.getColumn(columnTitle)

	if (!column) {
		return <div>Column not found</div>
	}

	const facets = column?.getFacetedUniqueValues()
	const selectedValues = new Set(column?.getFilterValue() as string[])

	const uniqueValues: string[] = JSON.parse(
		JSON.stringify(Array.from(facets?.keys()).sort()),
	)

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 border-dashed">
					<PlusCircledIcon className="mr-2 h-4 w-4" />
					<span className="capitalize">{columnTitle}</span>
					{selectedValues?.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									uniqueValues
										.filter(option => selectedValues.has(option))
										.map(option => (
											<Badge
												variant="secondary"
												key={option}
												className="rounded-sm px-1 font-normal"
											>
												{option}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={columnTitle} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{uniqueValues.map(option => {
								const isSelected = selectedValues.has(option)
								return (
									<CommandItem
										key={option}
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(option)
											} else {
												selectedValues.add(option)
											}
											const filterValues = Array.from(selectedValues)
											column?.setFilterValue(
												filterValues.length ? filterValues : undefined,
											)
										}}
									>
										<div className="flex items-center justify-center gap-2">
											<Checkbox checked={isSelected} />
											<span>{option}</span>
										</div>
										{facets?.get(option) && (
											<span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
												{facets.get(option)}
											</span>
										)}
									</CommandItem>
								)
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className="justify-center text-center"
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
