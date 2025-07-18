import Credentials from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import { LoginSchema } from '@/schemas'
import { getUserByEmail } from '@/lib/actions/user.action'
import { UserRole } from '@prisma/client'

export default {
	providers: [
		Credentials({
			async authorize(credentials) {
				try {
					const validatedFields = LoginSchema.safeParse(credentials)

					if (!validatedFields.success) {
						throw new Error('Invalid credentials')
					}

					const { email, password } = validatedFields.data

					const { data: user } = await getUserByEmail(email)
					if (!user) {
						throw new Error('User not found')
					}

					if (!user.password) {
						throw new Error('Please use social login or reset your password')
					}

					try {
						// const passwordsMatch = await bcrypt.compare(password, user.password)
						const passwordsMatch = password === user.password

						if (!passwordsMatch) {
							throw new Error('Incorrect password')
						}

						return user
					} catch (error) {
						if ((error as Error).message === 'Incorrect password') {
							throw error
						}
						throw new Error('Authentication error. Please try again.')
					}
				} catch (error) {
					console.error('Authorization error:', error)
					throw error
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				return {
					...token,
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role as UserRole,
					domain: user.domain as string,
					photo: user.photo,
					tenantId: user.tenantId,
				}
			}
			return token
		},
		async session({ session, token }) {
			return {
				...session,
				user: {
					id: token.id as string,
					name: token.name as string,
					email: token.email as string,
					role: token.role as UserRole,
					domain: token.domain as string | undefined,
					photo: token.photo as string | undefined,
					tenantId: token.tenantId as string | undefined,
				},
			}
		},
	},
	session: { strategy: 'jwt' },
	secret: process.env.AUTH_SECRET,
	pages: {
		signIn: '/login',
		error: '/error',
	},
	cookies: {
		sessionToken: {
			name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}session`,
			options: {
				httpOnly: false, // Set to false for client-side access eg. userbutton
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 7, // 7 days
			},
		},
	},
	trustHost: true,
} satisfies NextAuthConfig
