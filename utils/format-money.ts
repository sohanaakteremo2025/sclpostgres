type MoneyValue = string | number

export function formatMoney(
	amount: MoneyValue,
	currency: string = 'BDT',
	locale: string = 'en-US',
): string {
	// Convert to number if it's a string
	const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount

	// Format with Intl.NumberFormat
	const formatted = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		currencyDisplay: 'symbol',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numericAmount)

	// For BDT, manually ensure the symbol (৳) is used
	if (currency === 'BDT') {
		// Replace the currency code or any incorrect symbol with the proper BDT symbol
		return formatted.replace(/BDT|Tk/, '৳')
	}

	return formatted
}
