import { Button } from '@/components/ui/button'
import { PlusCircle, FileText, Settings } from 'lucide-react'

export function QuickActions() {
	return (
		<div className="flex flex-col space-y-4">
			<Button className="justify-start">
				<PlusCircle className="mr-2 h-4 w-4" />
				Add New Tenant
			</Button>
			<Button className="justify-start" variant="outline">
				<FileText className="mr-2 h-4 w-4" />
				Generate Report
			</Button>
			<Button className="justify-start" variant="outline">
				<Settings className="mr-2 h-4 w-4" />
				System Settings
			</Button>
		</div>
	)
}
