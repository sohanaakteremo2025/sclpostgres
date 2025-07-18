// lib/column-presets/index.ts
import {
	createColumns,
	type ColumnSchema,
} from '@/components/prisma-data-table/utils/columns-builder'
import {
	User,
	Building,
	DollarSign,
	Calendar,
	BookOpen,
	GraduationCap,
	FileText,
	Bell,
	Clock,
	CreditCard,
	Receipt,
	Shield,
	Phone,
	Mail,
	MapPin,
	IdCard,
	UserCheck,
	Award,
} from 'lucide-react'

// ======================
// USER PRESETS
// ======================
export const userColumnPresets = {
	basic: ['name', 'email', 'role'] as const,
	standard: ['name', 'email', 'role', 'status', 'createdAt'] as const,
	admin: [
		'select',
		'photo',
		'name',
		'email',
		'role',
		'status',
		'tenant.name',
		'createdAt',
		'actions',
	] as const,
	tenant: ['name', 'email', 'role', 'status'] as const,
} as const

export function createUserColumns(preset: keyof typeof userColumnPresets) {
	const allColumns = {
		select: { type: 'select' as const },
		photo: {
			type: 'custom' as const,
			header: 'Photo',
			render: (value: string) => (
				<img src={value} className="w-8 h-8 rounded-full" alt="User" />
			),
		},
		name: {
			type: 'text' as const,
			header: 'Name',
			icon: User,
			enableFilter: true,
			filter: { type: 'text' as const, placeholder: 'Search names...' },
		},
		email: {
			type: 'text' as const,
			header: 'Email',
			icon: Mail,
			enableFilter: true,
			filter: { type: 'text' as const, placeholder: 'Search emails...' },
		},
		role: {
			type: 'badge' as const,
			header: 'Role',
			icon: Shield,
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				options: [
					{ label: 'Admin', value: 'ADMIN' },
					{ label: 'Super Admin', value: 'SUPER_ADMIN' },
					{ label: 'Student', value: 'STUDENT' },
					{ label: 'Teacher', value: 'TEACHER' },
					{ label: 'Employee', value: 'EMPLOYEE' },
				],
			},
		},
		status: {
			type: 'badge' as const,
			header: 'Status',
			getVariant: (value: string) =>
				value === 'ACTIVE'
					? ('default' as const)
					: value === 'INACTIVE'
					? ('secondary' as const)
					: ('destructive' as const),
		},
		'tenant.name': { type: 'text' as const, header: 'Tenant', icon: Building },
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = userColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// TENANT PRESETS
// ======================
export const tenantColumnPresets = {
	basic: ['name', 'email', 'domain'] as const,
	standard: ['logo', 'name', 'email', 'domain', 'status'] as const,
	admin: [
		'select',
		'logo',
		'name',
		'email',
		'phone',
		'domain',
		'status',
		'createdAt',
		'actions',
	] as const,
} as const

export function createTenantColumns(preset: keyof typeof tenantColumnPresets) {
	const allColumns = {
		select: { type: 'select' as const },
		logo: {
			type: 'custom' as const,
			header: 'Logo',
			render: (value: string) => (
				<img src={value} className="w-8 h-8 rounded" alt="Logo" />
			),
		},
		name: {
			type: 'text' as const,
			header: 'Name',
			icon: Building,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		email: { type: 'text' as const, header: 'Email', icon: Mail },
		phone: { type: 'text' as const, header: 'Phone', icon: Phone },
		address: { type: 'text' as const, header: 'Address', icon: MapPin },
		domain: {
			type: 'text' as const,
			header: 'Domain',
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		status: {
			type: 'badge' as const,
			header: 'Status',
			getVariant: (value: string) =>
				value === 'ACTIVE'
					? ('default' as const)
					: value === 'SUSPENDED'
					? ('destructive' as const)
					: ('secondary' as const),
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = tenantColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// STUDENT PRESETS
// ======================
export const studentColumnPresets = {
	basic: ['name', 'studentId', 'section.class.name'] as const,
	standard: [
		'name',
		'studentId',
		'email',
		'section.class.name',
		'status',
	] as const,
	academic: [
		'name',
		'studentId',
		'section.class.name',
		'session.title',
		'admissionDate',
	] as const,
	teacher: [
		'name',
		'studentId',
		'roll',
		'section.class.name',
		'phone',
		'status',
	] as const,
	admin: [
		'select',
		'photo',
		'name',
		'studentId',
		'roll',
		'email',
		'phone',
		'section.class.name',
		'status',
		'createdAt',
		'actions',
	] as const,
	parent: [
		'name',
		'studentId',
		'section.class.name',
		'fatherName',
		'motherName',
		'guardianPhone',
	] as const,
	attendance: ['name', 'studentId', 'roll', 'section.class.name'] as const,
	finance: [
		'name',
		'studentId',
		'section.class.name',
		'fatherName',
		'guardianPhone',
	] as const,
} as const

export function createStudentColumns(
	preset: keyof typeof studentColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		photo: {
			type: 'custom' as const,
			header: 'Photo',
			render: (value: string) => (
				<img
					src={value || '/default-avatar.png'}
					className="w-8 h-8 rounded-full"
					alt="Student"
				/>
			),
		},
		name: {
			type: 'text' as const,
			header: 'Name',
			icon: User,
			enableFilter: true,
			filter: { type: 'text' as const, placeholder: 'Search names...' },
		},
		studentId: {
			type: 'text' as const,
			header: 'Student ID',
			icon: IdCard,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		roll: {
			type: 'text' as const,
			header: 'Roll',
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		email: { type: 'text' as const, header: 'Email', icon: Mail },
		phone: { type: 'text' as const, header: 'Phone', icon: Phone },
		religion: { type: 'text' as const, header: 'Religion' },
		gender: { type: 'text' as const, header: 'Gender' },
		dateOfBirth: { type: 'text' as const, header: 'Birth Date' },
		address: { type: 'text' as const, header: 'Address', icon: MapPin },
		fatherName: { type: 'text' as const, header: 'Father Name' },
		motherName: { type: 'text' as const, header: 'Mother Name' },
		guardianPhone: {
			type: 'text' as const,
			header: 'Guardian Phone',
			icon: Phone,
		},
		'section.class.name': {
			type: 'text' as const,
			header: 'Class',
			icon: BookOpen,
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				placeholder: 'Filter classes...',
			},
		},
		'session.title': {
			type: 'text' as const,
			header: 'Session',
			icon: Calendar,
		},
		admissionDate: {
			type: 'date' as const,
			header: 'Admission Date',
			icon: Calendar,
		},
		status: {
			type: 'badge' as const,
			header: 'Status',
			getVariant: (value: string) =>
				value === 'ACTIVE' ? ('default' as const) : ('secondary' as const),
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = studentColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// EMPLOYEE PRESETS
// ======================
export const employeeColumnPresets = {
	basic: ['name', 'email', 'designation'] as const,
	standard: ['name', 'email', 'phone', 'designation', 'createdAt'] as const,
	admin: [
		'select',
		'photo',
		'name',
		'email',
		'phone',
		'designation',
		'nationalId',
		'createdAt',
		'actions',
	] as const,
	hr: [
		'photo',
		'name',
		'email',
		'phone',
		'designation',
		'dateOfBirth',
		'address',
		'nationalId',
	] as const,
	attendance: ['name', 'designation', 'phone'] as const,
} as const

export function createEmployeeColumns(
	preset: keyof typeof employeeColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		photo: {
			type: 'custom' as const,
			header: 'Photo',
			render: (value: string) => (
				<img
					src={value || '/default-avatar.png'}
					className="w-8 h-8 rounded-full"
					alt="Employee"
				/>
			),
		},
		name: {
			type: 'text' as const,
			header: 'Name',
			icon: User,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		email: {
			type: 'text' as const,
			header: 'Email',
			icon: Mail,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		phone: { type: 'text' as const, header: 'Phone', icon: Phone },
		religion: { type: 'text' as const, header: 'Religion' },
		gender: { type: 'text' as const, header: 'Gender' },
		dateOfBirth: { type: 'text' as const, header: 'Birth Date' },
		address: { type: 'text' as const, header: 'Address', icon: MapPin },
		designation: {
			type: 'badge' as const,
			header: 'Designation',
			icon: Award,
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				placeholder: 'Filter designations...',
			},
		},
		nationalId: { type: 'text' as const, header: 'National ID', icon: IdCard },
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = employeeColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// CLASS PRESETS
// ======================
export const classColumnPresets = {
	basic: ['name'] as const,
	standard: ['name', 'createdAt'] as const,
	admin: ['select', 'name', 'createdAt', 'actions'] as const,
} as const

export function createClassColumns(preset: keyof typeof classColumnPresets) {
	const allColumns = {
		select: { type: 'select' as const },
		name: {
			type: 'text' as const,
			header: 'Class Name',
			icon: BookOpen,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = classColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// SECTION PRESETS
// ======================
export const sectionColumnPresets = {
	basic: ['name', 'class.name'] as const,
	standard: ['name', 'class.name', 'createdAt'] as const,
	admin: ['select', 'name', 'class.name', 'createdAt', 'actions'] as const,
} as const

export function createSectionColumns(
	preset: keyof typeof sectionColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		name: {
			type: 'text' as const,
			header: 'Section Name',
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		'class.name': {
			type: 'text' as const,
			header: 'Class',
			icon: BookOpen,
			enableFilter: true,
			filter: { type: 'multiSelect' as const },
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = sectionColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// SUBJECT PRESETS
// ======================
export const subjectColumnPresets = {
	basic: ['name', 'code', 'type'] as const,
	standard: ['name', 'code', 'type', 'class.name'] as const,
	admin: [
		'select',
		'name',
		'code',
		'type',
		'class.name',
		'section.name',
		'actions',
	] as const,
} as const

export function createSubjectColumns(
	preset: keyof typeof subjectColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		name: {
			type: 'text' as const,
			header: 'Subject Name',
			icon: BookOpen,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		code: { type: 'text' as const, header: 'Code' },
		type: {
			type: 'badge' as const,
			header: 'Type',
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				options: [
					{ label: 'Compulsory', value: 'COMPULSORY' },
					{ label: 'Elective', value: 'ELECTIVE' },
					{ label: 'Optional', value: 'OPTIONAL' },
					{ label: 'Practical', value: 'PRACTICAL' },
					{ label: 'Lab', value: 'LAB' },
				],
			},
		},
		'class.name': { type: 'text' as const, header: 'Class', icon: BookOpen },
		'section.name': { type: 'text' as const, header: 'Section' },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = subjectColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// EXAM PRESETS
// ======================
export const examColumnPresets = {
	basic: ['title', 'session.title'] as const,
	standard: ['title', 'session.title', 'createdAt'] as const,
	admin: ['select', 'title', 'session.title', 'createdAt', 'actions'] as const,
} as const

export function createExamColumns(preset: keyof typeof examColumnPresets) {
	const allColumns = {
		select: { type: 'select' as const },
		title: {
			type: 'text' as const,
			header: 'Exam Title',
			icon: FileText,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		'session.title': {
			type: 'text' as const,
			header: 'Session',
			icon: Calendar,
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = examColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// EXAM SCHEDULE PRESETS
// ======================
export const examScheduleColumnPresets = {
	basic: ['exam.title', 'subject.name', 'date', 'startTime'] as const,
	standard: [
		'exam.title',
		'subject.name',
		'section.name',
		'date',
		'startTime',
		'totalMarks',
	] as const,
	admin: [
		'select',
		'exam.title',
		'subject.name',
		'section.name',
		'date',
		'startTime',
		'endTime',
		'totalMarks',
		'room',
		'actions',
	] as const,
	teacher: [
		'exam.title',
		'subject.name',
		'section.name',
		'date',
		'startTime',
		'endTime',
		'room',
		'invigilator.name',
	] as const,
} as const

export function createExamScheduleColumns(
	preset: keyof typeof examScheduleColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'exam.title': { type: 'text' as const, header: 'Exam', icon: FileText },
		'subject.name': {
			type: 'text' as const,
			header: 'Subject',
			icon: BookOpen,
		},
		'section.name': { type: 'text' as const, header: 'Section' },
		date: { type: 'date' as const, header: 'Date', icon: Calendar },
		startTime: {
			type: 'custom' as const,
			header: 'Start Time',
			render: (value: number) =>
				`${Math.floor(value / 100)}:${(value % 100)
					.toString()
					.padStart(2, '0')}`,
		},
		endTime: {
			type: 'custom' as const,
			header: 'End Time',
			render: (value: number) =>
				`${Math.floor(value / 100)}:${(value % 100)
					.toString()
					.padStart(2, '0')}`,
		},
		totalMarks: { type: 'number' as const, header: 'Total Marks' },
		room: { type: 'text' as const, header: 'Room' },
		'invigilator.name': {
			type: 'text' as const,
			header: 'Invigilator',
			icon: UserCheck,
		},
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = examScheduleColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// EXAM RESULT PRESETS
// ======================
export const examResultColumnPresets = {
	basic: ['student.name', 'obtainedMarks'] as const,
	standard: [
		'student.name',
		'student.studentId',
		'obtainedMarks',
		'examSchedule.totalMarks',
	] as const,
	admin: [
		'select',
		'student.name',
		'student.studentId',
		'examSchedule.subject.name',
		'obtainedMarks',
		'examSchedule.totalMarks',
		'remarks',
		'actions',
	] as const,
	teacher: [
		'student.name',
		'student.studentId',
		'obtainedMarks',
		'examSchedule.totalMarks',
		'remarks',
	] as const,
} as const

export function createExamResultColumns(
	preset: keyof typeof examResultColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'student.name': { type: 'text' as const, header: 'Student', icon: User },
		'student.studentId': {
			type: 'text' as const,
			header: 'Student ID',
			icon: IdCard,
		},
		'examSchedule.subject.name': {
			type: 'text' as const,
			header: 'Subject',
			icon: BookOpen,
		},
		obtainedMarks: { type: 'number' as const, header: 'Obtained Marks' },
		'examSchedule.totalMarks': {
			type: 'number' as const,
			header: 'Total Marks',
		},
		remarks: { type: 'text' as const, header: 'Remarks' },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = examResultColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// STUDENT ATTENDANCE PRESETS
// ======================
export const studentAttendanceColumnPresets = {
	basic: ['student.name', 'date', 'status'] as const,
	standard: ['student.name', 'student.studentId', 'date', 'status'] as const,
	admin: [
		'select',
		'student.name',
		'student.studentId',
		'date',
		'status',
		'createdAt',
		'actions',
	] as const,
	teacher: ['student.name', 'student.studentId', 'date', 'status'] as const,
} as const

export function createStudentAttendanceColumns(
	preset: keyof typeof studentAttendanceColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'student.name': { type: 'text' as const, header: 'Student', icon: User },
		'student.studentId': {
			type: 'text' as const,
			header: 'Student ID',
			icon: IdCard,
		},
		date: { type: 'date' as const, header: 'Date', icon: Calendar },
		status: {
			type: 'badge' as const,
			header: 'Status',
			getVariant: (value: string) => {
				switch (value) {
					case 'PRESENT':
						return 'default' as const
					case 'ABSENT':
						return 'destructive' as const
					case 'LATE':
						return 'secondary' as const
					case 'LEAVE':
						return 'outline' as const
					default:
						return 'default' as const
				}
			},
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = studentAttendanceColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// EMPLOYEE ATTENDANCE PRESETS
// ======================
export const employeeAttendanceColumnPresets = {
	basic: ['employee.name', 'date', 'status'] as const,
	standard: [
		'employee.name',
		'employee.designation',
		'date',
		'status',
	] as const,
	admin: [
		'select',
		'employee.name',
		'employee.designation',
		'date',
		'status',
		'createdAt',
		'actions',
	] as const,
	hr: ['employee.name', 'employee.designation', 'date', 'status'] as const,
} as const

export function createEmployeeAttendanceColumns(
	preset: keyof typeof employeeAttendanceColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'employee.name': { type: 'text' as const, header: 'Employee', icon: User },
		'employee.designation': {
			type: 'text' as const,
			header: 'Designation',
			icon: Award,
		},
		date: { type: 'date' as const, header: 'Date', icon: Calendar },
		status: {
			type: 'badge' as const,
			header: 'Status',
			getVariant: (value: string) => {
				switch (value) {
					case 'PRESENT':
						return 'default' as const
					case 'ABSENT':
						return 'destructive' as const
					case 'LATE':
						return 'secondary' as const
					case 'LEAVE':
						return 'outline' as const
					default:
						return 'default' as const
				}
			},
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = employeeAttendanceColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// FEE STRUCTURE PRESETS
// ======================
export const feeStructureColumnPresets = {
	basic: ['title'] as const,
	standard: ['title', 'createdAt'] as const,
	admin: ['select', 'title', 'createdAt', 'actions'] as const,
} as const

export function createFeeStructureColumns(
	preset: keyof typeof feeStructureColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		title: {
			type: 'text' as const,
			header: 'Title',
			icon: Receipt,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = feeStructureColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// FEE ITEM PRESETS
// ======================
export const feeItemColumnPresets = {
	basic: ['name', 'amount', 'frequency'] as const,
	standard: [
		'name',
		'amount',
		'frequency',
		'waiverType',
		'waiverValue',
	] as const,
	admin: [
		'select',
		'name',
		'amount',
		'frequency',
		'waiverType',
		'waiverValue',
		'lateFeeEnabled',
		'lateFeeAmount',
		'actions',
	] as const,
	finance: [
		'name',
		'amount',
		'frequency',
		'waiverType',
		'waiverValue',
		'lateFeeEnabled',
		'lateFeeAmount',
	] as const,
} as const

export function createFeeItemColumns(
	preset: keyof typeof feeItemColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		name: {
			type: 'text' as const,
			header: 'Fee Name',
			icon: Receipt,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		amount: {
			type: 'number' as const,
			header: 'Amount',
			precision: 2,
			unit: '৳',
		},
		frequency: {
			type: 'badge' as const,
			header: 'Frequency',
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				options: [
					{ label: 'One Time', value: 'ONE_TIME' },
					{ label: 'Daily', value: 'DAILY' },
					{ label: 'Weekly', value: 'WEEKLY' },
					{ label: 'Monthly', value: 'MONTHLY' },
					{ label: 'Quarterly', value: 'QUARTERLY' },
					{ label: 'Annually', value: 'ANNUALLY' },
				],
			},
		},
		waiverType: {
			type: 'badge' as const,
			header: 'Waiver Type',
			getVariant: (value: string) =>
				value === 'PERCENTAGE' ? ('default' as const) : ('secondary' as const),
		},
		waiverValue: {
			type: 'number' as const,
			header: 'Waiver Value',
			precision: 2,
		},
		lateFeeEnabled: {
			type: 'badge' as const,
			header: 'Late Fee',
			getVariant: (value: boolean) =>
				value ? ('default' as const) : ('secondary' as const),
			render: (value: boolean) => (value ? 'Enabled' : 'Disabled'),
		},
		lateFeeAmount: {
			type: 'number' as const,
			header: 'Late Fee Amount',
			precision: 2,
			unit: '৳',
		},
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = feeItemColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// STUDENT DUE PRESETS
// ======================
export const studentDueColumnPresets = {
	basic: ['student.name', 'month', 'year'] as const,
	standard: [
		'student.name',
		'student.studentId',
		'month',
		'year',
		'createdAt',
	] as const,
	admin: [
		'select',
		'student.name',
		'student.studentId',
		'month',
		'year',
		'createdAt',
		'actions',
	] as const,
	finance: [
		'student.name',
		'student.studentId',
		'student.section.class.name',
		'month',
		'year',
	] as const,
} as const

export function createStudentDueColumns(
	preset: keyof typeof studentDueColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'student.name': { type: 'text' as const, header: 'Student', icon: User },
		'student.studentId': {
			type: 'text' as const,
			header: 'Student ID',
			icon: IdCard,
		},
		'student.section.class.name': {
			type: 'text' as const,
			header: 'Class',
			icon: BookOpen,
		},
		month: { type: 'number' as const, header: 'Month' },
		year: { type: 'number' as const, header: 'Year' },
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = studentDueColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// DUE ITEM PRESETS
// ======================
export const dueItemColumnPresets = {
	basic: ['title', 'amount'] as const,
	standard: ['title', 'amount', 'due.student.name'] as const,
	admin: [
		'select',
		'title',
		'amount',
		'due.student.name',
		'due.student.studentId',
		'createdAt',
		'actions',
	] as const,
	finance: [
		'title',
		'amount',
		'due.student.name',
		'due.student.studentId',
		'due.month',
		'due.year',
	] as const,
} as const

export function createDueItemColumns(
	preset: keyof typeof dueItemColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		title: { type: 'text' as const, header: 'Item', icon: Receipt },
		amount: {
			type: 'number' as const,
			header: 'Amount',
			precision: 2,
			unit: '৳',
		},
		'due.student.name': {
			type: 'text' as const,
			header: 'Student',
			icon: User,
		},
		'due.student.studentId': {
			type: 'text' as const,
			header: 'Student ID',
			icon: IdCard,
		},
		'due.month': { type: 'number' as const, header: 'Month' },
		'due.year': { type: 'number' as const, header: 'Year' },
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = dueItemColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// STUDENT PAYMENT PRESETS
// ======================
export const studentPaymentColumnPresets = {
	basic: ['amount', 'method', 'createdAt'] as const,
	standard: [
		'dueItem.due.student.name',
		'amount',
		'method',
		'createdAt',
	] as const,
	admin: [
		'select',
		'dueItem.due.student.name',
		'dueItem.due.student.studentId',
		'dueItem.title',
		'amount',
		'method',
		'createdAt',
		'actions',
	] as const,
	finance: [
		'dueItem.due.student.name',
		'dueItem.due.student.studentId',
		'dueItem.title',
		'amount',
		'method',
		'createdAt',
	] as const,
} as const

export function createStudentPaymentColumns(
	preset: keyof typeof studentPaymentColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'dueItem.due.student.name': {
			type: 'text' as const,
			header: 'Student',
			icon: User,
		},
		'dueItem.due.student.studentId': {
			type: 'text' as const,
			header: 'Student ID',
			icon: IdCard,
		},
		'dueItem.title': {
			type: 'text' as const,
			header: 'Fee Item',
			icon: Receipt,
		},
		amount: {
			type: 'number' as const,
			header: 'Amount',
			precision: 2,
			unit: '৳',
		},
		method: {
			type: 'badge' as const,
			header: 'Method',
			icon: CreditCard,
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				options: [
					{ label: 'Cash', value: 'CASH' },
					{ label: 'bKash', value: 'BKASH' },
					{ label: 'Nagad', value: 'NAGAD' },
					{ label: 'Mobile Banking', value: 'MOBILE_BANKING' },
					{ label: 'Bank', value: 'BANK' },
					{ label: 'Card', value: 'CARD' },
				],
			},
		},
		createdAt: {
			type: 'date' as const,
			header: 'Payment Date',
			icon: Calendar,
		},
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = studentPaymentColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// STUDENT INVOICE PRESETS
// ======================
export const studentInvoiceColumnPresets = {
	basic: ['student.name', 'createdAt'] as const,
	standard: ['student.name', 'student.studentId', 'createdAt'] as const,
	admin: [
		'select',
		'student.name',
		'student.studentId',
		'student.section.class.name',
		'createdAt',
		'actions',
	] as const,
	finance: [
		'student.name',
		'student.studentId',
		'student.section.class.name',
		'createdAt',
	] as const,
} as const

export function createStudentInvoiceColumns(
	preset: keyof typeof studentInvoiceColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'student.name': { type: 'text' as const, header: 'Student', icon: User },
		'student.studentId': {
			type: 'text' as const,
			header: 'Student ID',
			icon: IdCard,
		},
		'student.section.class.name': {
			type: 'text' as const,
			header: 'Class',
			icon: BookOpen,
		},
		createdAt: {
			type: 'date' as const,
			header: 'Invoice Date',
			icon: Calendar,
		},
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = studentInvoiceColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// SALARY STRUCTURE PRESETS
// ======================
export const salaryStructureColumnPresets = {
	basic: ['title'] as const,
	standard: ['title', 'createdAt'] as const,
	admin: ['select', 'title', 'createdAt', 'actions'] as const,
} as const

export function createSalaryStructureColumns(
	preset: keyof typeof salaryStructureColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		title: {
			type: 'text' as const,
			header: 'Title',
			icon: DollarSign,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = salaryStructureColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// SALARY DUE PRESETS
// ======================
export const salaryDueColumnPresets = {
	basic: ['employee.name', 'amount', 'month', 'year'] as const,
	standard: [
		'employee.name',
		'employee.designation',
		'amount',
		'month',
		'year',
	] as const,
	admin: [
		'select',
		'employee.name',
		'employee.designation',
		'amount',
		'month',
		'year',
		'createdAt',
		'actions',
	] as const,
	hr: [
		'employee.name',
		'employee.designation',
		'amount',
		'month',
		'year',
	] as const,
} as const

export function createSalaryDueColumns(
	preset: keyof typeof salaryDueColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		'employee.name': { type: 'text' as const, header: 'Employee', icon: User },
		'employee.designation': {
			type: 'text' as const,
			header: 'Designation',
			icon: Award,
		},
		amount: {
			type: 'number' as const,
			header: 'Amount',
			precision: 2,
			unit: '৳',
		},
		month: { type: 'number' as const, header: 'Month' },
		year: { type: 'number' as const, header: 'Year' },
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = salaryDueColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// NOTICE PRESETS
// ======================
export const noticeColumnPresets = {
	basic: ['title', 'createdAt'] as const,
	standard: ['title', 'content', 'createdAt'] as const,
	admin: ['select', 'title', 'content', 'createdAt', 'actions'] as const,
} as const

export function createNoticeColumns(preset: keyof typeof noticeColumnPresets) {
	const allColumns = {
		select: { type: 'select' as const },
		title: {
			type: 'text' as const,
			header: 'Title',
			icon: Bell,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		content: {
			type: 'text' as const,
			header: 'Content',
			className: 'max-w-[300px] truncate',
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = noticeColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// SMS ORDER PRESETS
// ======================
export const smsOrderColumnPresets = {
	basic: ['credits', 'amount', 'status'] as const,
	standard: ['credits', 'amount', 'method', 'status', 'createdAt'] as const,
	admin: [
		'select',
		'credits',
		'amount',
		'method',
		'trxId',
		'status',
		'createdAt',
		'actions',
	] as const,
} as const

export function createSMSOrderColumns(
	preset: keyof typeof smsOrderColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		credits: { type: 'number' as const, header: 'Credits' },
		amount: {
			type: 'number' as const,
			header: 'Amount',
			precision: 2,
			unit: '৳',
		},
		method: {
			type: 'badge' as const,
			header: 'Method',
			icon: CreditCard,
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				options: [
					{ label: 'Cash', value: 'CASH' },
					{ label: 'bKash', value: 'BKASH' },
					{ label: 'Nagad', value: 'NAGAD' },
					{ label: 'Mobile Banking', value: 'MOBILE_BANKING' },
					{ label: 'Bank', value: 'BANK' },
					{ label: 'Card', value: 'CARD' },
				],
			},
		},
		trxId: { type: 'text' as const, header: 'Transaction ID' },
		status: {
			type: 'badge' as const,
			header: 'Status',
			getVariant: (value: string) => {
				switch (value) {
					case 'APPROVED':
						return 'default' as const
					case 'PENDING':
						return 'secondary' as const
					case 'REJECTED':
						return 'destructive' as const
					default:
						return 'outline' as const
				}
			},
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = smsOrderColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// TENANT TRANSACTION PRESETS
// ======================
export const tenantTransactionColumnPresets = {
	basic: ['label', 'amount', 'type'] as const,
	standard: ['label', 'amount', 'type', 'category', 'createdAt'] as const,
	admin: [
		'select',
		'label',
		'amount',
		'type',
		'category',
		'transactionBy',
		'account.title',
		'createdAt',
		'actions',
	] as const,
	finance: [
		'label',
		'amount',
		'type',
		'category',
		'account.title',
		'createdAt',
	] as const,
} as const

export function createTenantTransactionColumns(
	preset: keyof typeof tenantTransactionColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		label: {
			type: 'text' as const,
			header: 'Label',
			icon: Receipt,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		amount: {
			type: 'number' as const,
			header: 'Amount',
			precision: 2,
			unit: '৳',
		},
		type: {
			type: 'badge' as const,
			header: 'Type',
			getVariant: (value: string) =>
				value === 'INCOME' ? ('default' as const) : ('destructive' as const),
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				options: [
					{ label: 'Income', value: 'INCOME' },
					{ label: 'Expense', value: 'EXPENSE' },
				],
			},
		},
		category: {
			type: 'text' as const,
			header: 'Category',
			enableFilter: true,
			filter: { type: 'multiSelect' as const },
		},
		transactionBy: { type: 'text' as const, header: 'Transaction By' },
		'account.title': {
			type: 'text' as const,
			header: 'Account',
			icon: DollarSign,
		},
		note: {
			type: 'text' as const,
			header: 'Note',
			className: 'max-w-[200px] truncate',
		},
		createdAt: { type: 'date' as const, header: 'Date', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = tenantTransactionColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// TENANT ACCOUNT PRESETS
// ======================
export const tenantAccountColumnPresets = {
	basic: ['title', 'balance'] as const,
	standard: ['title', 'balance', 'createdAt'] as const,
	admin: ['select', 'title', 'balance', 'createdAt', 'actions'] as const,
} as const

export function createTenantAccountColumns(
	preset: keyof typeof tenantAccountColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		title: {
			type: 'text' as const,
			header: 'Account Title',
			icon: DollarSign,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		balance: {
			type: 'number' as const,
			header: 'Balance',
			precision: 2,
			unit: '৳',
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = tenantAccountColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// ACADEMIC SESSION PRESETS
// ======================
export const academicSessionColumnPresets = {
	basic: ['title', 'startDate', 'endDate'] as const,
	standard: ['title', 'startDate', 'endDate', 'status'] as const,
	admin: [
		'select',
		'title',
		'startDate',
		'endDate',
		'status',
		'createdAt',
		'actions',
	] as const,
} as const

export function createAcademicSessionColumns(
	preset: keyof typeof academicSessionColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		title: {
			type: 'text' as const,
			header: 'Session Title',
			icon: Calendar,
			enableFilter: true,
			filter: { type: 'text' as const },
		},
		startDate: { type: 'date' as const, header: 'Start Date', icon: Calendar },
		endDate: { type: 'date' as const, header: 'End Date', icon: Calendar },
		status: {
			type: 'badge' as const,
			header: 'Status',
			getVariant: (value: string) => {
				switch (value) {
					case 'ONGOING':
						return 'default' as const
					case 'UPCOMING':
						return 'secondary' as const
					case 'ENDED':
						return 'outline' as const
					default:
						return 'outline' as const
				}
			},
		},
		createdAt: { type: 'date' as const, header: 'Created', icon: Calendar },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = academicSessionColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// CLASS ROUTINE PRESETS
// ======================
export const classRoutineColumnPresets = {
	basic: ['dayOfWeek', 'startTime', 'endTime', 'subject.name'] as const,
	standard: [
		'dayOfWeek',
		'startTime',
		'endTime',
		'subject.name',
		'section.name',
		'teacher.name',
	] as const,
	admin: [
		'select',
		'dayOfWeek',
		'startTime',
		'endTime',
		'subject.name',
		'section.name',
		'teacher.name',
		'room',
		'actions',
	] as const,
	teacher: [
		'dayOfWeek',
		'startTime',
		'endTime',
		'subject.name',
		'section.name',
		'room',
	] as const,
} as const

export function createClassRoutineColumns(
	preset: keyof typeof classRoutineColumnPresets,
) {
	const allColumns = {
		select: { type: 'select' as const },
		dayOfWeek: {
			type: 'badge' as const,
			header: 'Day',
			enableFilter: true,
			filter: {
				type: 'multiSelect' as const,
				options: [
					{ label: 'Monday', value: 'MONDAY' },
					{ label: 'Tuesday', value: 'TUESDAY' },
					{ label: 'Wednesday', value: 'WEDNESDAY' },
					{ label: 'Thursday', value: 'THURSDAY' },
					{ label: 'Friday', value: 'FRIDAY' },
					{ label: 'Saturday', value: 'SATURDAY' },
					{ label: 'Sunday', value: 'SUNDAY' },
				],
			},
		},
		startTime: {
			type: 'custom' as const,
			header: 'Start Time',
			icon: Clock,
			render: (value: number) =>
				`${Math.floor(value / 100)}:${(value % 100)
					.toString()
					.padStart(2, '0')}`,
		},
		endTime: {
			type: 'custom' as const,
			header: 'End Time',
			icon: Clock,
			render: (value: number) =>
				`${Math.floor(value / 100)}:${(value % 100)
					.toString()
					.padStart(2, '0')}`,
		},
		'subject.name': {
			type: 'text' as const,
			header: 'Subject',
			icon: BookOpen,
		},
		'section.name': { type: 'text' as const, header: 'Section' },
		'teacher.name': {
			type: 'text' as const,
			header: 'Teacher',
			icon: GraduationCap,
		},
		room: { type: 'text' as const, header: 'Room' },
		actions: {
			type: 'actions' as const,
			actions: ['view', 'update', 'delete'] as const,
		},
	} satisfies ColumnSchema<any>

	const selectedKeys = classRoutineColumnPresets[preset]
	const selectedColumns = Object.fromEntries(
		selectedKeys.map(key => [key, allColumns[key]]),
	)
	return createColumns(selectedColumns)
}

// ======================
// MASTER PRESET REGISTRY
// ======================
export const presetRegistry = {
	user: { presets: userColumnPresets, createColumns: createUserColumns },
	tenant: { presets: tenantColumnPresets, createColumns: createTenantColumns },
	student: {
		presets: studentColumnPresets,
		createColumns: createStudentColumns,
	},
	employee: {
		presets: employeeColumnPresets,
		createColumns: createEmployeeColumns,
	},
	class: { presets: classColumnPresets, createColumns: createClassColumns },
	section: {
		presets: sectionColumnPresets,
		createColumns: createSectionColumns,
	},
	subject: {
		presets: subjectColumnPresets,
		createColumns: createSubjectColumns,
	},
	exam: { presets: examColumnPresets, createColumns: createExamColumns },
	examSchedule: {
		presets: examScheduleColumnPresets,
		createColumns: createExamScheduleColumns,
	},
	examResult: {
		presets: examResultColumnPresets,
		createColumns: createExamResultColumns,
	},
	studentAttendance: {
		presets: studentAttendanceColumnPresets,
		createColumns: createStudentAttendanceColumns,
	},
	employeeAttendance: {
		presets: employeeAttendanceColumnPresets,
		createColumns: createEmployeeAttendanceColumns,
	},
	feeStructure: {
		presets: feeStructureColumnPresets,
		createColumns: createFeeStructureColumns,
	},
	feeItem: {
		presets: feeItemColumnPresets,
		createColumns: createFeeItemColumns,
	},
	studentDue: {
		presets: studentDueColumnPresets,
		createColumns: createStudentDueColumns,
	},
	dueItem: {
		presets: dueItemColumnPresets,
		createColumns: createDueItemColumns,
	},
	studentPayment: {
		presets: studentPaymentColumnPresets,
		createColumns: createStudentPaymentColumns,
	},
	studentInvoice: {
		presets: studentInvoiceColumnPresets,
		createColumns: createStudentInvoiceColumns,
	},
	salaryStructure: {
		presets: salaryStructureColumnPresets,
		createColumns: createSalaryStructureColumns,
	},
	salaryDue: {
		presets: salaryDueColumnPresets,
		createColumns: createSalaryDueColumns,
	},
	notice: { presets: noticeColumnPresets, createColumns: createNoticeColumns },
	smsOrder: {
		presets: smsOrderColumnPresets,
		createColumns: createSMSOrderColumns,
	},
	tenantTransaction: {
		presets: tenantTransactionColumnPresets,
		createColumns: createTenantTransactionColumns,
	},
	tenantAccount: {
		presets: tenantAccountColumnPresets,
		createColumns: createTenantAccountColumns,
	},
	academicSession: {
		presets: academicSessionColumnPresets,
		createColumns: createAcademicSessionColumns,
	},
	classRoutine: {
		presets: classRoutineColumnPresets,
		createColumns: createClassRoutineColumns,
	},
} as const

// ======================
// UTILITY FUNCTIONS
// ======================
export type ModelName = keyof typeof presetRegistry
export type PresetName<T extends ModelName> =
	keyof (typeof presetRegistry)[T]['presets']

// Generic function to create columns for any model
export function createModelColumns<T extends ModelName>(
	modelName: T,
	preset: PresetName<T>,
) {
	return presetRegistry[modelName].createColumns(preset as any)
}

// Get available presets for a model
export function getAvailablePresets<T extends ModelName>(modelName: T) {
	return Object.keys(presetRegistry[modelName].presets) as PresetName<T>[]
}
