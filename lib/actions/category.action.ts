'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSubdomainDB } from '../getSubdomainDB'
import { getCurrentUser } from './auth.action'

// Schema for category creation/update
const categorySchema = z.object({
	value: z.string().min(1, 'Value is required'),
	label: z.string().min(1, 'Label is required'),
})

export type CategoryFormData = z.infer<typeof categorySchema>

/**
 * Create a new category
 */
export async function createCategory(formData: CategoryFormData) {
	try {
		const db = await getSubdomainDB()
		// Validate input
		const validatedData = categorySchema.parse(formData)

		// Get current tenant
		const user = await getCurrentUser()

		if (!user || !user.id) {
			throw new Error('Unauthorized: No tenant found')
		}

		// Check if category already exists in this tenant
		const existingCategory = await db.transactionCategory.findFirst({
			where: {
				value: validatedData.value,
				tenantId: user.tenantId as string,
			},
		})

		if (existingCategory) {
			return {
				success: false,
				error: { value: ['A category with this value already exists'] },
			}
		}

		// Create category in database
		const category = await db.transactionCategory.create({
			data: {
				value: validatedData.value,
				label: validatedData.label,
				tenantId: user.tenantId as string,
			},
		})

		// Revalidate relevant paths
		revalidatePath('/dashboard/transactions')
		revalidatePath('/dashboard/settings/categories')

		return { success: true, data: category }
	} catch (error) {
		console.error('Error creating category:', error)
		if (error instanceof z.ZodError) {
			return { success: false, error: error.flatten().fieldErrors }
		}

		// MongoDB-specific error handling
		if ((error as any).code === 11000) {
			// MongoDB duplicate key error
			return {
				success: false,
				error: { value: ['A category with this value already exists'] },
			}
		}

		return {
			success: false,
			error: { _form: ['Failed to create category. Please try again.'] },
		}
	}
}

/**
 * Get all categories for current tenant
 */
export async function getCategories() {
	try {
		const db = await getSubdomainDB()
		const user = await getCurrentUser()
		console.log(user)

		if (!user || !user.tenantId) {
			throw new Error('Unauthorized: No tenant found')
		}

		const categories = await db.transactionCategory.findMany({
			where: {
				tenantId: user.tenantId as string,
			},
			orderBy: {
				label: 'asc',
			},
		})

		return { success: true, data: categories }
	} catch (error) {
		console.error('Error fetching categories:', error)
		return { success: false, error: 'Failed to fetch categories' }
	}
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string) {
	try {
		const user = await getCurrentUser()
		const db = await getSubdomainDB()

		if (!user || !user.tenantId) {
			throw new Error('Unauthorized: No tenant found')
		}

		// Check if category belongs to tenant
		const category = await db.transactionCategory.findFirst({
			where: {
				id: categoryId,
				tenantId: user.tenantId as string,
			},
		})

		if (!category) {
			throw new Error('Category not found or unauthorized')
		}

		// Delete the category
		await db.transactionCategory.delete({
			where: {
				id: categoryId,
			},
		})

		// Revalidate relevant paths
		revalidatePath('/dashboard/transactions')
		revalidatePath('/dashboard/settings/categories')

		return { success: true }
	} catch (error) {
		console.error('Error deleting category:', error)
		return { success: false, error: 'Failed to delete category' }
	}
}
