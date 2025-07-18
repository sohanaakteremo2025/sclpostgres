// utils/crypto.ts
const SECRET_KEY = (process.env.ENCRYPTION_SECRET || 'Visionsoftwares')
	.padEnd(32, '0')
	.slice(0, 32)

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Derives a 256-bit CryptoKey from a secret string.
 */
async function getKey(secret: string): Promise<CryptoKey> {
	const keyData = encoder.encode(secret)
	return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, [
		'encrypt',
		'decrypt',
	])
}

/**
 * Encrypts plain text using AES-GCM.
 */
export async function encryptPassword(text: string): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV
	const key = await getKey(SECRET_KEY)
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		encoder.encode(text),
	)

	// Combine IV and ciphertext
	const combined = new Uint8Array(iv.length + encrypted.byteLength)
	combined.set(iv)
	combined.set(new Uint8Array(encrypted), iv.length)

	return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts encrypted AES-GCM base64 string.
 */
export async function decryptPassword(base64: string): Promise<string> {
	const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
	const iv = data.slice(0, 12)
	const encrypted = data.slice(12)
	const key = await getKey(SECRET_KEY)

	const decrypted = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		key,
		encrypted,
	)

	return decoder.decode(decrypted)
}
