'use server'

import * as z from 'zod'
import bcrypt from 'bcryptjs'
import { getPrismaClient } from '@/lib/db'
import { RegisterSchema } from '@/schemas'
import { getUserByEmail } from './account.action'

//create account always in main db
export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const validatedFields = RegisterSchema.safeParse(values)
	if (!validatedFields.success) {
		console.error('Validation error:', validatedFields.error)
		return { success: false, error: 'Invalid fields!' }
	}

	try {
		const { email, password, name } = validatedFields.data

		// Check for existing user
		const existingUser = await getUserByEmail(email)
		if (existingUser) {
			return { success: false, error: 'Email already in use!' }
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Prepare data for account creation
		const userData = {
			email: email,
			password: hashedPassword,
			name: name,
			role: 'user', // Default role
			profileId: email,
		}

		const prisma = getPrismaClient()
		// Create user
		const user = await prisma.user.create({ data: userData })
		console.log('Registered user:', user)

		return { success: true, message: 'Account created successfully' }
	} catch (error) {
		console.error('Registration error:', error)

		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'An unexpected error occurred.',
		}
	}
}
