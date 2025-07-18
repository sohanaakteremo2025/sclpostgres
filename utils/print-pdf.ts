import React from 'react'

export const printPDFContent = (contentRef: React.RefObject<HTMLElement>) => {
	const printWindow = window.open('', '_blank')
	if (printWindow && contentRef.current) {
		printWindow.document.write('<html><head><title>Print</title>')
		printWindow.document.write('<style>')
		printWindow.document.write(`
      body { font-family: Arial, sans-serif; }
      .print-content { max-width: 800px; margin: 0 auto; padding: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    `)
		printWindow.document.write('</style></head><body>')
		printWindow.document.write(contentRef.current.outerHTML)
		printWindow.document.write('</body></html>')
		printWindow.document.close()
		printWindow.print()
	}
}
