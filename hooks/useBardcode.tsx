'use client'
import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

const useBarcode = (value: string, options = {}) => {
	const barcodeRef = useRef(null)

	useEffect(() => {
		if (barcodeRef.current) {
			JsBarcode(barcodeRef.current, value, {
				format: 'CODE128',
				width: 2,
				height: 40,
				displayValue: false,
				...options,
			})
		}
	}, [value, options])

	return barcodeRef
}

export default useBarcode
