'use client'
import { useEffect, useState } from 'react'

type SetValue<T> = T | ((val: T) => T)

function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, (value: SetValue<T>) => void] {
	// Initialize state with initialValue
	const [storedValue, setStoredValue] = useState<T>(initialValue)

	// After mount, try to fetch from localStorage and update state
	useEffect(() => {
		try {
			const item = window.localStorage.getItem(key)
			if (item) {
				setStoredValue(JSON.parse(item))
			}
		} catch (error) {}
	}, [key])

	const setValue = (value: SetValue<T>) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value

			// Save state
			setStoredValue(valueToStore)

			// Save to localStorage
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(key, JSON.stringify(valueToStore))
			}
		} catch (error) {}
	}

	return [storedValue, setValue]
}

export default useLocalStorage
