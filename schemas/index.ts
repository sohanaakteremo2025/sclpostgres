import * as z from 'zod'

export const LoginSchema = z.object({
	email: z.string().min(1, {
		message: 'Email is required',
	}),
	password: z.string().min(1, {
		message: 'Password is required',
	}),
})

export const RegisterSchema = z
	.object({
		name: z
			.string()
			.min(2, {
				message: 'Name must be at least 2 characters.',
			})
			.max(50, {
				message: 'Name cannot exceed 50 characters.',
			}),
		email: z.string().email({
			message: 'Please enter a valid email address.',
		}),
		password: z
			.string()
			.min(8, {
				message: 'Password must be at least 8 characters.',
			})
			.max(100, {
				message: 'Password cannot exceed 100 characters.',
			})
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
			}),
		confirmPassword: z.string(),
		// Photo is optional
		photo: z.string().optional(),
		role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'STUDENT', 'TEACHER']), // adjust based on your UserRole enum
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})
