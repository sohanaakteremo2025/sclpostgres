'use client'

import React, { forwardRef, ReactNode, useRef, useCallback } from 'react'

type PrintWrapperProps = {
	children: ReactNode
	buttonText?: string
	buttonClass?: string
	wrapperClass?: string
	contentClass?: string
	buttonPosition?: 'top' | 'bottom' | 'left' | 'right'
	buttonComponent?: React.ReactElement<{ onClick?: () => void }>
	onBeforePrint?: () => void | Promise<void>
	onAfterPrint?: () => void
	onPrintError?: (error: Error) => void
	documentTitle?: string
	pageStyle?: string
	removeAfterPrint?: boolean
	suppressErrors?: boolean
	noPrint?: string
	copyStyles?: boolean
	bodyClass?: string
	includeGlobalStyles?: boolean
}

const PrintWrapper = forwardRef<HTMLDivElement, PrintWrapperProps>(
	(
		{
			children,
			buttonText = 'Print',
			buttonClass = '',
			wrapperClass = '',
			contentClass = '',
			buttonPosition = 'bottom',
			buttonComponent,
			onBeforePrint,
			onAfterPrint,
			onPrintError,
			documentTitle = 'Document',
			pageStyle = `
				@page {
					size: A4;
					margin: 20mm;
				}
				@media print {
					body {
						-webkit-print-color-adjust: exact;
						color-adjust: exact;
						margin: 0;
						padding: 0;
					}
					.no-print, .print\\:hidden {
						display: none !important;
					}
					.page-break-after {
						page-break-after: always;
					}
				}
			`,
			removeAfterPrint = true,
			suppressErrors = false,
			noPrint = 'no-print',
			copyStyles = true,
			bodyClass = '',
			includeGlobalStyles = true,
		},
		ref,
	) => {
		const internalRef = useRef<HTMLDivElement>(null)
		const contentRef = ref || internalRef

		const handlePrint = useCallback(async () => {
			if (!contentRef.current) {
				console.error('PrintWrapper: No content to print')
				return
			}

			try {
				// Call onBeforePrint callback
				if (onBeforePrint) {
					await onBeforePrint()
				}

				// Get the content to print
				const printContent = contentRef.current
				
				// Create a new window for printing with specific settings to hide headers/footers
				const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
				if (!printWindow) {
					throw new Error('Failed to open print window')
				}

				// Get all stylesheets from the current document
				let styles = pageStyle
				
				if (copyStyles && includeGlobalStyles) {
					// Collect existing stylesheets
					const styleSheets = Array.from(document.styleSheets)
					for (const sheet of styleSheets) {
						try {
							if (sheet.href && sheet.href.includes(window.location.origin)) {
								// External stylesheet from same origin
								const response = await fetch(sheet.href)
								const css = await response.text()
								styles += `\n${css}`
							} else if (sheet.cssRules) {
								// Inline stylesheet
								const rules = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n')
								styles += `\n${rules}`
							}
						} catch (e) {
							// Skip stylesheets we can't access
							console.warn('Could not access stylesheet:', e)
						}
					}
				}

				// Write the HTML structure with empty title to avoid header/footer text
				printWindow.document.write(`
					<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title></title>
						<style>
							${styles}
							@media print {
								@page {
									margin-top: 0 !important;
									margin-bottom: 0 !important;
								}
								body {
									margin: 0 !important;
									padding: 0 !important;
								}
							}
						</style>
					</head>
					<body class="${bodyClass}">
						${printContent.outerHTML}
					</body>
					</html>
				`)

				printWindow.document.close()

				// Wait for content and styles to load
				await new Promise<void>((resolve) => {
					printWindow.onload = () => resolve()
					// Fallback timeout
					setTimeout(resolve, 500)
				})

				// Focus and print
				printWindow.focus()
				printWindow.print()

				// Handle cleanup
				if (removeAfterPrint) {
					printWindow.onafterprint = () => {
						printWindow.close()
					}
					// Fallback cleanup
					setTimeout(() => {
						if (!printWindow.closed) {
							printWindow.close()
						}
					}, 1000)
				}

				// Call onAfterPrint callback
				if (onAfterPrint) {
					onAfterPrint()
				}

			} catch (error) {
				console.error('PrintWrapper error:', error)
				if (onPrintError && !suppressErrors) {
					onPrintError(error as Error)
				}
				
				// Fallback to regular print
				if (!suppressErrors) {
					console.warn('Falling back to window.print()')
					window.print()
				}
			}
		}, [
			contentRef,
			onBeforePrint,
			onAfterPrint,
			onPrintError,
			documentTitle,
			pageStyle,
			removeAfterPrint,
			suppressErrors,
			copyStyles,
			includeGlobalStyles,
			bodyClass,
		])

		const renderButton = () => {
			if (buttonComponent) {
				return React.cloneElement(buttonComponent, {
					onClick: handlePrint,
				})
			}

			return (
				<button
					onClick={handlePrint}
					className={`print-button ${buttonClass}`}
					aria-label="Print document"
					type="button"
				>
					{buttonText}
				</button>
			)
		}

		const getFlexDirection = () => {
			switch (buttonPosition) {
				case 'top':
					return 'column-reverse'
				case 'bottom':
					return 'column'
				case 'left':
					return 'row-reverse'
				case 'right':
					return 'row'
				default:
					return 'column'
			}
		}

		return (
			<div
				className={`print-wrapper ${wrapperClass}`}
				style={{
					display: 'flex',
					flexDirection: getFlexDirection(),
					gap: '16px',
					alignItems: 'flex-start',
				}}
			>
				<div
					ref={contentRef}
					className={`print-content ${contentClass} ${noPrint ? '' : 'printable-content'}`}
					style={{
						width: '100%',
					}}
				>
					{children}
				</div>
				<div className={noPrint}>
					{renderButton()}
				</div>
			</div>
		)
	},
)

PrintWrapper.displayName = 'PrintWrapper'

export default PrintWrapper