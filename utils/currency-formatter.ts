export type CurrencyCode =
	| 'BDT'
	| 'USD'
	| 'EUR'
	| 'GBP'
	| 'JPY'
	| 'CNY'
	| 'AUD'
	| 'CAD'
	| 'CHF'
	| 'HKD'
	| 'SGD'
	| 'INR'
	| 'BRL'
	| 'MXN'
	| 'RUB'
	| 'ZAR'
	| 'SEK'
	| 'NOK'
	| 'DKK'
	| 'NZD'
	| 'PLN'
	| 'TRY'
	| 'KRW'
	| 'AED'
	| 'SAR'
	| string

export type LocaleCode =
	| 'bn-BD'
	| 'en-US'
	| 'en-GB'
	| 'es-ES'
	| 'fr-FR'
	| 'de-DE'
	| 'it-IT'
	| 'ja-JP'
	| 'zh-CN'
	| 'zh-TW'
	| 'ko-KR'
	| 'ru-RU'
	| 'pt-BR'
	| 'ar-SA'
	| 'hi-IN'
	| 'nl-NL'
	| string

export type NotationStyle =
	| 'standard'
	| 'scientific'
	| 'engineering'
	| 'compact'
export type SignDisplay = 'auto' | 'always' | 'never' | 'exceptZero'

export interface CurrencyFormatOptions {
	currency?: CurrencyCode
	locale?: LocaleCode
	minimumFractionDigits?: number
	maximumFractionDigits?: number
	useGrouping?: boolean
	currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'
	signDisplay?: SignDisplay
	notation?: NotationStyle
	accountingFormat?: boolean
	abbreviate?: boolean
	roundToNearest?: number
	zeroDisplay?: string
}

const DEFAULT_FORMAT_OPTIONS: Required<CurrencyFormatOptions> = {
	currency: 'BDT',
	locale: 'en-BD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	useGrouping: true,
	currencyDisplay: 'narrowSymbol',
	signDisplay: 'auto',
	notation: 'standard',
	accountingFormat: false,
	abbreviate: false,
	roundToNearest: 0,
	zeroDisplay: '',
}

interface CurrencyData {
	fractionDigits: number
	zeroDecimal: boolean
	roundingRules?: {
		roundToNearest: number
	}
}

const CURRENCY_DATA: Record<CurrencyCode, CurrencyData> = {
	BDT: { fractionDigits: 2, zeroDecimal: false },
	USD: { fractionDigits: 2, zeroDecimal: false },
	EUR: { fractionDigits: 2, zeroDecimal: false },
	GBP: { fractionDigits: 2, zeroDecimal: false },
	JPY: { fractionDigits: 0, zeroDecimal: true },
	CNY: { fractionDigits: 2, zeroDecimal: false },
	KRW: { fractionDigits: 0, zeroDecimal: true },
	HUF: { fractionDigits: 0, zeroDecimal: true },
	TWD: { fractionDigits: 0, zeroDecimal: true },
	CHF: {
		fractionDigits: 2,
		zeroDecimal: false,
		roundingRules: { roundToNearest: 0.05 },
	},
	DKK: { fractionDigits: 2, zeroDecimal: false },
	SEK: { fractionDigits: 2, zeroDecimal: false },
	NOK: { fractionDigits: 2, zeroDecimal: false },
	CAD: { fractionDigits: 2, zeroDecimal: false },
	AUD: { fractionDigits: 2, zeroDecimal: false },
	NZD: { fractionDigits: 2, zeroDecimal: false },
	INR: { fractionDigits: 2, zeroDecimal: false },
	SGD: { fractionDigits: 2, zeroDecimal: false },
	HKD: { fractionDigits: 2, zeroDecimal: false },
	BRL: { fractionDigits: 2, zeroDecimal: false },
	MXN: { fractionDigits: 2, zeroDecimal: false },
	RUB: { fractionDigits: 2, zeroDecimal: false },
	ZAR: { fractionDigits: 2, zeroDecimal: false },
	PLN: { fractionDigits: 2, zeroDecimal: false },
	TRY: { fractionDigits: 2, zeroDecimal: false },
	AED: { fractionDigits: 2, zeroDecimal: false },
	SAR: { fractionDigits: 2, zeroDecimal: false },
}

interface CurrencyConversionOptions {
	from: CurrencyCode
	to: CurrencyCode
	rate: number
	cacheResult?: boolean
	rateDate?: string
}

const exchangeRateCache: Map<string, { rate: number; timestamp: number }> =
	new Map()
const CACHE_TIMEOUT = 60 * 60 * 1000

export class CurrencyFormatter {
	private options: Required<CurrencyFormatOptions>
	private intlFormatter: Intl.NumberFormat | null = null

	constructor(options: CurrencyFormatOptions = {}) {
		this.options = { ...DEFAULT_FORMAT_OPTIONS, ...options }
		this.updateIntlFormatter()
	}

	public static create(options: CurrencyFormatOptions = {}): CurrencyFormatter {
		return new CurrencyFormatter(options)
	}

	public format(
		value: number,
		options?: Partial<CurrencyFormatOptions>,
	): string {
		const mergedOptions: Required<CurrencyFormatOptions> = {
			...this.options,
			...(options || {}),
		}

		if (value === 0 && mergedOptions.zeroDisplay) {
			return mergedOptions.zeroDisplay
		}

		if (mergedOptions.roundToNearest && mergedOptions.roundToNearest > 0) {
			value = this.roundToNearest(value, mergedOptions.roundToNearest)
		} else {
			const currencyData =
				CURRENCY_DATA[mergedOptions.currency] || CURRENCY_DATA['BDT']
			if (
				currencyData.roundingRules &&
				currencyData.roundingRules.roundToNearest > 0
			) {
				value = this.roundToNearest(
					value,
					currencyData.roundingRules.roundToNearest,
				)
			}
		}

		const formatter = options
			? this.createFormatter(mergedOptions)
			: this.getFormatter()
		let formatted = formatter.format(value)

		if (mergedOptions.accountingFormat && value < 0) {
			formatted = formatted.replace(/^-/, '')
			formatted = `(${formatted})`
		}

		if (mergedOptions.abbreviate && mergedOptions.notation === 'standard') {
			return this.abbreviateNumber(value, mergedOptions)
		}

		return formatted
	}

	public formatAsCurrency(
		value: number,
		currencyCode: CurrencyCode,
		options?: Partial<CurrencyFormatOptions>,
	): string {
		return this.format(value, { ...options, currency: currencyCode })
	}

	public parse(currencyString: string): number {
		let normalizedString = currencyString
			.replace(/[^\d.-]/g, '')
			.replace(/^\./, '0.')
			.trim()

		if (currencyString.includes('(') && currencyString.includes(')')) {
			normalizedString = '-' + normalizedString
		}

		const result = parseFloat(normalizedString)
		return isNaN(result) ? 0 : result
	}

	public convert(
		value: number,
		conversionOptions: CurrencyConversionOptions,
		formatOptions?: Partial<CurrencyFormatOptions>,
	): string {
		const { from, to, rate, cacheResult = true } = conversionOptions

		const cacheKey = `${from}-${to}`
		const cachedData = exchangeRateCache.get(cacheKey)

		let effectiveRate = rate

		if (
			!rate &&
			cachedData &&
			Date.now() - cachedData.timestamp < CACHE_TIMEOUT
		) {
			effectiveRate = cachedData.rate
		} else if (rate && cacheResult) {
			exchangeRateCache.set(cacheKey, {
				rate,
				timestamp: Date.now(),
			})
		}

		if (!effectiveRate) {
			throw new Error(`No exchange rate available for ${from} to ${to}`)
		}

		const convertedValue = value * effectiveRate

		return this.format(convertedValue, {
			...formatOptions,
			currency: to,
		})
	}

	public calculatePercentage(
		value: number,
		percentage: number,
		options?: Partial<CurrencyFormatOptions>,
	): string {
		const result = value * (percentage / 100)
		return this.format(result, options)
	}

	public formatRange(
		minValue: number,
		maxValue: number,
		options?: Partial<CurrencyFormatOptions>,
	): string {
		if (minValue === maxValue) {
			return this.format(minValue, options)
		}

		return `${this.format(minValue, options)} - ${this.format(
			maxValue,
			options,
		)}`
	}

	public updateOptions(
		options: Partial<CurrencyFormatOptions>,
	): CurrencyFormatter {
		this.options = { ...this.options, ...options }
		this.updateIntlFormatter()
		return this
	}

	public getOptions(): Required<CurrencyFormatOptions> {
		return { ...this.options }
	}

	public static clearExchangeRateCache(): void {
		exchangeRateCache.clear()
	}

	public static getCurrencyData(
		currencyCode: CurrencyCode,
	): CurrencyData | undefined {
		return CURRENCY_DATA[currencyCode]
	}

	public static isZeroDecimalCurrency(currencyCode: CurrencyCode): boolean {
		return CURRENCY_DATA[currencyCode]?.zeroDecimal || false
	}

	public static forLocale(
		locale: LocaleCode,
		currencyCode: CurrencyCode,
	): CurrencyFormatter {
		return new CurrencyFormatter({
			locale,
			currency: currencyCode,
			...(CURRENCY_DATA[currencyCode]
				? {
						minimumFractionDigits: CURRENCY_DATA[currencyCode].fractionDigits,
						maximumFractionDigits: CURRENCY_DATA[currencyCode].fractionDigits,
				  }
				: {}),
		})
	}

	private updateIntlFormatter(): void {
		this.intlFormatter = this.createFormatter(this.options)
	}

	private getFormatter(): Intl.NumberFormat {
		if (!this.intlFormatter) {
			this.updateIntlFormatter()
		}
		return this.intlFormatter!
	}

	private createFormatter(
		options: Required<CurrencyFormatOptions>,
	): Intl.NumberFormat {
		const currencyData = CURRENCY_DATA[options.currency] || CURRENCY_DATA['BDT']

		let minFractionDigits = options.minimumFractionDigits
		let maxFractionDigits = options.maximumFractionDigits

		if (
			options.minimumFractionDigits ===
				DEFAULT_FORMAT_OPTIONS.minimumFractionDigits &&
			options.maximumFractionDigits ===
				DEFAULT_FORMAT_OPTIONS.maximumFractionDigits
		) {
			minFractionDigits = currencyData.fractionDigits
			maxFractionDigits = currencyData.fractionDigits
		}

		return new Intl.NumberFormat(options.locale, {
			style: 'currency',
			currency: options.currency,
			currencyDisplay: options.currencyDisplay,
			minimumFractionDigits: minFractionDigits,
			maximumFractionDigits: maxFractionDigits,
			useGrouping: options.useGrouping,
			signDisplay: options.accountingFormat ? 'never' : options.signDisplay,
			notation: options.notation,
		})
	}

	private roundToNearest(value: number, nearest: number): number {
		return Math.round(value / nearest) * nearest
	}

	private abbreviateNumber(
		value: number,
		options: Required<CurrencyFormatOptions>,
	): string {
		const abs = Math.abs(value)
		const sign = value < 0 ? '-' : ''

		let result: string
		let formatted: string

		const currencySymbol = new Intl.NumberFormat(options.locale, {
			style: 'currency',
			currency: options.currency,
			currencyDisplay: options.currencyDisplay,
			useGrouping: false,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})
			.format(0)
			.replace(/[0-9]/g, '')
			.trim()

		if (abs >= 1e12) {
			formatted = (sign + (abs / 1e12).toFixed(1)).replace(/\.0$/, '')
			result = `${currencySymbol}${formatted}T`
		} else if (abs >= 1e9) {
			formatted = (sign + (abs / 1e9).toFixed(1)).replace(/\.0$/, '')
			result = `${currencySymbol}${formatted}B`
		} else if (abs >= 1e6) {
			formatted = (sign + (abs / 1e6).toFixed(1)).replace(/\.0$/, '')
			result = `${currencySymbol}${formatted}M`
		} else if (abs >= 1e3) {
			formatted = (sign + (abs / 1e3).toFixed(1)).replace(/\.0$/, '')
			result = `${currencySymbol}${formatted}K`
		} else {
			return this.getFormatter().format(value)
		}

		return result
	}
}

export default CurrencyFormatter

export const bdtFormatter = CurrencyFormatter.create({
	currency: 'BDT',
	locale: 'bn-BD',
})
export const usdFormatter = CurrencyFormatter.create({
	currency: 'USD',
	locale: 'en-US',
})
export const eurFormatter = CurrencyFormatter.create({
	currency: 'EUR',
	locale: 'en-US',
})
export const gbpFormatter = CurrencyFormatter.create({
	currency: 'GBP',
	locale: 'en-GB',
})
export const jpyFormatter = CurrencyFormatter.create({
	currency: 'JPY',
	locale: 'ja-JP',
})
export const cnyFormatter = CurrencyFormatter.create({
	currency: 'CNY',
	locale: 'zh-CN',
})

export function formatCurrency(
	value: number,
	options?: CurrencyFormatOptions,
): string {
	return CurrencyFormatter.create(options).format(value)
}
