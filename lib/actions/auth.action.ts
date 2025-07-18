'use server'

import { auth, signIn } from '@/auth'
import { User, UserStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { LoginSchema } from '@/schemas'
import { UserRole } from '@prisma/client'
import { getRoleSpecificPath } from '@/utils/role-based-path'
import { getUserByEmail } from './user.action'
import { RegisterSchema } from '@/schemas'
import { prisma } from '@/lib/db'
import { createCachedAction } from '../cache-actions'
import { CACHE_KEYS } from '@/constants/cache'

const hashPassword = async (password: string) => {
	return bcrypt.hash(password, 10)
}

export async function createAccount(data: any) {
	const hashedPassword = await hashPassword(data.password)
	try {
		const account = await prisma.user.create({
			data: { ...data, password: hashedPassword },
		})
		revalidatePath('/cms/admins')
		return JSON.parse(JSON.stringify(account))
	} catch (error) {
		console.log('Account creation error')
	}
}

export async function deleteAccount(id: string) {
	const account = await prisma.user.delete({ where: { id } })
	revalidatePath('/cms/admins')
	return JSON.parse(JSON.stringify(account))
}

export async function updateAccount(id: string, data: any) {
	const hashedPassword = await hashPassword(data.password)
	const account = await prisma.user.update({
		where: { id },
		data: { ...data, password: hashedPassword },
	})
	revalidatePath('/cms/admins')
	return JSON.parse(JSON.stringify(account))
}

//get user by id
export async function getUserById(id: string) {
	const user = await prisma.user.findUnique({ where: { id } })
	return user
}

export const getCachedUserById = async (id: string) =>
	createCachedAction(getUserById, {
		cacheKey: CACHE_KEYS.GET_USER_BY_ID.BASE(id),
		tags: [CACHE_KEYS.GET_USER_BY_ID.TAG],
		revalidate: 3600,
	})(id)

// get current logged in user account
export async function getCurrentUser(): Promise<User | null> {
	const session = await auth()
	if (!session?.user) return null
	const id = session.user.id as string
	return getCachedUserById(id)
}

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	try {
		// Validate input fields
		const validatedFields = RegisterSchema.safeParse(values)

		if (!validatedFields.success) {
			return { error: 'Invalid fields! Please check your information.' }
		}

		// Extract validated data (excluding confirmPassword which is not in the database)
		const { name, email, password, role, photo } = validatedFields.data

		// Check if user already exists
		const { data: existingUser } = await getUserByEmail(email)

		if (existingUser) {
			return {
				error:
					'Email already in use. Please use a different email or try logging in.',
			}
		}

		// Hash the password
		// const hashedPassword = await bcrypt.hash(password, 10)
		const hashedPassword = password

		// Create the user
		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: role as UserRole,
				status: UserStatus.ACTIVE,
				photo: photo || null,
			},
		})

		// Return success with the user ID
		return {
			success: 'Registration successful! You can now log in.',
			userId: newUser.id,
		}
	} catch (error) {
		console.error('REGISTRATION_ERROR', error)

		// Handle specific database errors
		if (error instanceof Error) {
			if (error.message.includes('Unique constraint')) {
				return { error: 'This email is already registered.' }
			}
		}

		return {
			error: 'Something went wrong during registration. Please try again.',
		}
	}
}

export const login = async (
	values: z.infer<typeof LoginSchema>,
	callbackUrl?: string | null,
) => {
	const validatedFields = LoginSchema.safeParse(values)

	if (!validatedFields.success) {
		return { error: 'Invalid fields!' }
	}

	const { email, password } = validatedFields.data

	try {
		// Get user from database
		const { data: existingUser, error: userError } = await getUserByEmail(email)

		// Handle user lookup errors
		if (userError) {
			console.error('Error fetching user:', userError)
			return { error: 'An error occurred while looking up your account.' }
		}

		// User not found
		if (!existingUser) {
			return { error: 'No account found with this email address.' }
		}

		// User exists but has no password (likely uses social login)
		if (!existingUser.password) {
			return {
				error:
					"This account doesn't have a password. Please use social login or reset your password.",
			}
		}

		const passwordsMatch = password === existingUser.password
		if (!passwordsMatch) {
			return { error: 'Incorrect password.' }
		}

		// Determine redirect path based on role and domain
		let redirectPath

		if (existingUser.role === UserRole.SUPER_ADMIN) {
			redirectPath = '/cms'
		} else {
			// For all other roles, use the domain-specific dashboard path
			const rolePath = getRoleSpecificPath(existingUser.role)
			const domain = existingUser.domain

			if (domain) {
				// If we have a domain, construct the institution-specific path
				redirectPath = `/institution/${domain}/${rolePath}`
			} else {
				// Fallback if no domain is available
				redirectPath = '/'
			}
		}

		try {
			// For NextAuth App Router, we need to use the new auth.js signin approach
			await signIn('credentials', {
				email,
				password,
				redirect: false, // Important: we handle redirect ourselves
			})

			// After successful auth, return success with redirect info
			return {
				success: 'Logged in successfully!',
				redirectUrl: callbackUrl || redirectPath,
			}
		} catch (error) {
			console.error('Auth signin error:', error)
			if (error instanceof AuthError) {
				return {
					error: 'Authentication failed. Please check your credentials.',
				}
			}
			return { error: 'Something went wrong during authentication.' }
		}
	} catch (error) {
		console.error('Unexpected login error:', error)
		return {
			error: 'Something went wrong during login process. Please try again.',
		}
	}
}
