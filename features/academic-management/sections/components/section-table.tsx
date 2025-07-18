'use client'
import React from 'react'
import { PrismaDataTable, QueryResult } from '@/components/prisma-data-table'
import { sectionsColumns } from './columns'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import SectionForm from './section-form'
import { deleteSection, updateSection } from '../api/section.action'
import { Section, UpdateSectionInput } from '@/lib/zod'

interface SectionTableProps {
	dataPromise: Promise<QueryResult<any>>
}

export default function SectionTable({ dataPromise }: SectionTableProps) {
	return (
		<div>
			<PrismaDataTable
				dataPromise={dataPromise}
				columns={sectionsColumns}
				pinnedColumns={{ right: ['actions'] }}
			>
				<PrismaDataTable.CreateDialog
					trigger={
						<Button>
							<PlusCircle className="h-4 w-4" /> Create Section
						</Button>
					}
				>
					{({ onSuccess }) => <SectionForm onSuccess={onSuccess} />}
				</PrismaDataTable.CreateDialog>
				<PrismaDataTable.UpdateDialog>
					{({ item, onSuccess }) => (
						<SectionForm onSuccess={onSuccess} item={item as Section} />
					)}
				</PrismaDataTable.UpdateDialog>
				<PrismaDataTable.DeleteDialog
					title="Delete Section"
					getDescription={(item: Section) =>
						`Are you sure you want to delete "${item.name}"?`
					}
					onDelete={async item => {
						await deleteSection(item.id)
					}}
				/>
			</PrismaDataTable>
		</div>
	)
}
