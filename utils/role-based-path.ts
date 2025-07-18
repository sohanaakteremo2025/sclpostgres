import { UserRole } from '@prisma/client'

export function getRoleSpecificPath(role: UserRole): string {
	switch (role) {
		case UserRole.ADMIN:
			return 'admin'
		case UserRole.STUDENT:
			return 'student'
		case UserRole.TEACHER:
			return 'teacher'
		case UserRole.EMPLOYEE:
			return 'employee'
		case UserRole.SUPER_ADMIN:
			return 'cms'
		default:
			return ''
	}
}
