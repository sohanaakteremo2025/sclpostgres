import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'

export function AccordionWrapper({
	children,
	title,
}: {
	children: React.ReactNode
	title: string
}) {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value={title.trim().split(' ').join('-')}>
				<AccordionTrigger className="text-blue-600">{title}</AccordionTrigger>
				<AccordionContent>{children}</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
